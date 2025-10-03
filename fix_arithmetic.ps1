$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Fix value / 1000000 patterns
    if ($content -match "\(value / 1000000\)") {
        $content = $content -replace "\(value / 1000000\)", "(Number(value) / 1000000)"
        $updated = $true
    }
    
    # Fix value / 1000 patterns
    if ($content -match "\(value / 1000\)") {
        $content = $content -replace "\(value / 1000\)", "(Number(value) / 1000)"
        $updated = $true
    }
    
    # Fix b.count - a.count patterns
    if ($content -match "b\.count - a\.count") {
        $content = $content -replace "b\.count - a\.count", "Number(b.count) - Number(a.count)"
        $updated = $true
    }
    
    # Fix b.value - a.value patterns
    if ($content -match "b\.value - a\.value") {
        $content = $content -replace "b\.value - a\.value", "Number(b.value) - Number(a.value)"
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated arithmetic in: $($file.Name)"
    }
}
