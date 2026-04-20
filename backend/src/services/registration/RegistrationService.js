const BaseService = require('../BaseService');
const RegistrationDraft = require('../../models/RegistrationDraft');
const RegistrationVerification = require('../../models/RegistrationVerification');
const Customer = require('../../models/Customer');
const Application = require('../../models/Application');
const AuditLogService = require('../AuditLogService');
const crypto = require('crypto');

class RegistrationService extends BaseService {
    constructor() {
        super('RegistrationService');
    }

    /**
     * @desc Save a registration draft
     */
    async saveDraft(tempSessionId, formData) {
        try {
            const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

            let draft = await RegistrationDraft.findOne({ tempSessionId });
            if (!draft) {
                draft = new RegistrationDraft({
                    draftId: crypto.randomBytes(8).toString('hex').toUpperCase(),
                    tempSessionId
                });
            }

            // Assign to formData explicitly as Mixed type
            draft.formData = formData;
            draft.expiresAt = expiresAt;

            await draft.save();
            this.logSuccess('saveDraft', { draftId: draft.draftId });
            return draft;
        } catch (error) {
            this.handleError(error, 'saveDraft');
        }
    }

    /**
     * @desc Finalize and Convert Draft to Application
     */
    async finalizeRegistration(tempSessionId, context = {}) {
        return this.executeTransaction(async (session) => {
            const draft = await RegistrationDraft.findOne({ tempSessionId }).session(session);
            const verif = await RegistrationVerification.findOne({ tempSessionId }).session(session);

            if (!draft || draft.finalSubmissionStatus === 'COMPLETED') {
                throw new Error('Invalid draft or already submitted');
            }

            // 1. Identity Validation
            if (!verif || !verif.emailVerifiedTemp || !verif.mobileVerifiedTemp) {
                throw new Error('Identity verification (Email/Mobile) incomplete');
            }

            const data = draft.formData || {};

            // 2. Uniqueness Check (NIC/Email)
            const existingCustomer = await Customer.findOne({ 
                $or: [{ email: data.email }, { nic: data.nic }] 
            }).session(session);
            
            if (existingCustomer) {
                throw new Error('NIC or Email already registered');
            }
            
            // 3. Create Customer Record
            const customer = await Customer.create([{
                fullName: data.name || data.fullName,
                email: data.email,
                mobile: data.phone || data.mobile,
                nic: data.nic,
                isActive: false,
                address: {
                    line1: data.address,
                    city: data.city,
                    district: data.district,
                    province: data.province
                },
                bankDetails: {
                    bankName: data.bankName,
                    branchName: data.branchName,
                    accountHolder: data.accountHolder,
                    accountNumber: data.accountNumber
                }
            }], { session });

            // 4. Create Formal Application
            const referenceId = `NF-${Math.floor(100000 + Math.random() * 900000)}`;
            const application = await Application.create([{
                customerId: customer[0]._id,
                referenceId,
                status: 'SUBMITTED',
                preferredBranch: data.preferredBranch || 'MAIN-OFFICE', // Map from draft
                applicationDate: new Date(),
                bankDetails: {
                    bankName: data.bankName,
                    branchName: data.branchName,
                    accountHolder: data.accountHolder,
                    accountNumber: data.accountNumber
                }
            }], { session });

            // 5. Mark Draft as COMPLETED
            draft.finalSubmissionStatus = 'COMPLETED';
            await draft.save({ session });

            // 6. Audit the Action
            await AuditLogService.log({
                userId: null, // No user session yet
                action: 'SUBMIT_REGISTRATION',
                target: 'APPLICATION',
                targetId: application[0]._id,
                newData: { referenceId, customerId: customer[0]._id },
                req: context.req
            });

            this.logSuccess('finalizeRegistration', { referenceId });
            return { referenceId, customerId: customer[0]._id };
        });
    }
}

module.exports = new RegistrationService();
