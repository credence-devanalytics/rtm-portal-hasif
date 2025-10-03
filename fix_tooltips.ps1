$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "CustomTooltip \/>") {
        $content = $content -replace "CustomTooltip \/\>", 'CustomTooltip active={undefined} payload={undefined} label={undefined} />'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated tooltip in: $($file.Name)"
    }
}
