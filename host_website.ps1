
# Validates if strict requirements are met
$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$domain = "Medflow.offlinestore"
$ip = "127.0.0.1"
$entry = "$ip       $domain"

# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator to map the domain!" -ForegroundColor Red
    Write-Host "Right-click this file -> 'Run with PowerShell' (as Admin)"
    Start-Sleep -s 5
    Exit
}

# Add to Hosts File
$content = Get-Content $hostsPath -Raw
if ($content -notmatch [regex]::Escape($domain)) {
    Add-Content -Path $hostsPath -Value "`r`n$entry" -Force
    Write-Host "Domain mapped successfully: $domain" -ForegroundColor Green
} else {
    Write-Host "Domain already mapped." -ForegroundColor Yellow
}

# Install http-server if missing
if (!(Get-Command "http-server" -ErrorAction SilentlyContinue)) {
    Write-Host "Installing local server..."
    npm install -g http-server
}

# Start Server
Write-Host "Starting Server at http://$domain ..." -ForegroundColor Cyan
http-server -p 80
