$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Where-Object { $_.Name -like "*Chart*" -or $_.Name -like "*Table*" }
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "<Card>") {
        $content = $content -replace "<Card>", '<Card className="">'
        $content = $content -replace "<CardHeader>", '<CardHeader className="">'
        $content = $content -replace "<CardTitle>", '<CardTitle className="">'
        $content = $content -replace "<CardDescription>", '<CardDescription className="">'
        $content = $content -replace "<CardContent>", '<CardContent className="">'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
