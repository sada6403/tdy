$c = Get-Content "c:\work\nf plantation full project\nf plantation project\admin-portal\src\pages\HeroManagement.jsx"
# Add closing div after line 615 (index 614)
$newContent = $c[0..614] + "                                         </div>" + $c[615..($c.Count-1)]
$newContent | Set-Content "c:\work\nf plantation full project\nf plantation project\admin-portal\src\pages\HeroManagement.jsx"

