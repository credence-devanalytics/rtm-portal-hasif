$files = Get-ChildItem -Path "src/app" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Fix Button missing variant
    if ($content -match '<Button[^>]*onClick[^>]*size[^>]*className[^>]*>' -and $content -notmatch 'variant=') {
        $content = $content -replace '(<Button[^>]*)(size="[^"]*")([^>]*>)', '$1variant="default" $2$3'
        $updated = $true
    }
    
    # Fix Button missing className
    if ($content -match '<Button[^>]*variant[^>]*size[^>]*>' -and $content -notmatch 'className=') {
        $content = $content -replace '(<Button[^>]*variant="[^"]*")([^>]*>)', '$1 className=""$2'
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated Button components in: $($file.Name)"
    }
}
