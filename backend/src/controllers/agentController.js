const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const EmailService = require('../services/notifications/EmailService');

exports.getAllAgents = async (req, res, next) => {
    try {
        const agents = await Agent.find().populate('branchId').sort({ name: 1 });
        res.json({ success: true, count: agents.length, data: agents });
    } catch (error) {
        next(error);
    }
};

exports.createAgent = async (req, res, next) => {
    try {
        const { name, branchId, contact, email, employeeId, designation, department, nic, address, dob, gender, hireDate } = req.body;
        const agent = await Agent.create({ name, branchId, contact, email, employeeId, designation, department, nic, address, dob, gender, hireDate });
        await agent.populate('branchId');
        res.status(201).json({ success: true, data: agent });
    } catch (error) {
        next(error);
    }
};

exports.updateAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, branchId, contact, email, employeeId, designation, department, nic, address, dob, gender, hireDate, isActive } = req.body;
        const agent = await Agent.findByIdAndUpdate(
            id,
            { name, branchId, contact, email, employeeId, designation, department, nic, address, dob, gender, hireDate, isActive },
            { new: true, runValidators: true }
        ).populate('branchId');
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
        res.json({ success: true, data: agent });
    } catch (error) {
        next(error);
    }
};

exports.deleteAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Agent.findByIdAndDelete(id);
        res.json({ success: true, message: 'Agent deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getUnassignedCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find({
            isActive: true,
            $or: [{ agentId: { $exists: false } }, { agentId: null }]
        }).populate('branchId', 'name').sort({ createdAt: -1 }).limit(100);

        res.json({ success: true, count: customers.length, data: customers });
    } catch (error) {
        next(error);
    }
};

exports.assignCustomer = async (req, res, next) => {
    try {
        const { id: agentId } = req.params;
        const { customerId } = req.body;

        const [agent, customer] = await Promise.all([
            Agent.findById(agentId).populate('branchId'),
            Customer.findById(customerId).populate('branchId')
        ]);

        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

        customer.agentId = agentId;
        await customer.save();

        if (!agent.assignedCustomers.map(String).includes(String(customerId))) {
            agent.assignedCustomers.push(customerId);
            await agent.save();
        }

        // Email to customer
        try {
            await EmailService.sendAgentAssignmentEmailToCustomer({
                customerEmail: customer.email,
                customerName: customer.fullName,
                agentName: agent.name,
                agentContact: agent.contact,
                agentEmail: agent.email || 'N/A',
                branchName: agent.branchId?.name || 'NF Plantation Branch',
                branchAddress: agent.branchId?.address || ''
            });
        } catch (err) {
            console.error('[AGENT ASSIGN] Customer email failed:', err.message);
        }

        // Email to agent
        if (agent.email) {
            try {
                await EmailService.sendCustomerDetailsEmailToAgent({
                    agentEmail: agent.email,
                    agentName: agent.name,
                    customerName: customer.fullName,
                    customerNIC: customer.nic,
                    customerMobile: customer.mobile,
                    customerEmail: customer.email,
                    customerAddress: [customer.address?.line1, customer.address?.city, customer.address?.district]
                        .filter(Boolean).join(', '),
                    branchName: agent.branchId?.name || 'NF Plantation Branch'
                });
            } catch (err) {
                console.error('[AGENT ASSIGN] Agent email failed:', err.message);
            }
        }

        res.json({ success: true, message: 'Customer assigned to agent successfully', data: { agent, customer } });
    } catch (error) {
        next(error);
    }
};
