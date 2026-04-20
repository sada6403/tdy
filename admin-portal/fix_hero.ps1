$c = Get-Content "c:\work\nf plantation full project\nf plantation project\admin-portal\src\pages\HeroManagement.jsx"
$newContent = $c[0..669] + $c[671..($c.Count-1)]
$newContent | Set-Content "c:\work\nf plantation full project\nf plantation project\admin-portal\src\pages\HeroManagement.jsx"
