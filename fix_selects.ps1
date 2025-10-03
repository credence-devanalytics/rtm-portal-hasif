$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $updated = $false
    
    # Fix SelectContent
    if ($content -match "<SelectContent>") {
        $content = $content -replace "<SelectContent>", '<SelectContent className="">'
        $updated = $true
    }
    
    # Fix SelectItem
    if ($content -match "<SelectItem ") {
        $content = $content -replace "<SelectItem ", '<SelectItem className="" '
        $updated = $true
    }
    
    # Fix TabsList
    if ($content -match "<TabsList>") {
        $content = $content -replace "<TabsList>", '<TabsList className="">'
        $updated = $true
    }
    
    # Fix TabsTrigger
    if ($content -match "<TabsTrigger ") {
        $content = $content -replace "<TabsTrigger ", '<TabsTrigger className="" '
        $updated = $true
    }
    
    if ($updated) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated Select/Tab components in: $($file.Name)"
    }
}
