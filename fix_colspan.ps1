$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Fix colSpan with quotes to numbers
    if ($content -match 'colSpan="[0-9]+"') {
        $content = $content -replace 'colSpan="([0-9]+)"', 'colSpan={$1}'
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed colSpan in: $($file.Name)"
    }
}
