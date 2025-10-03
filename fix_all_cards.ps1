$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "<Card>|<CardHeader>|<CardTitle>|<CardDescription>|<CardContent>") {
        $updated = $false
        if ($content -match "<Card>") {
            $content = $content -replace "<Card>", '<Card className="">'
            $updated = $true
        }
        if ($content -match "<CardHeader>") {
            $content = $content -replace "<CardHeader>", '<CardHeader className="">'
            $updated = $true
        }
        if ($content -match "<CardTitle>") {
            $content = $content -replace "<CardTitle>", '<CardTitle className="">'
            $updated = $true
        }
        if ($content -match "<CardDescription>") {
            $content = $content -replace "<CardDescription>", '<CardDescription className="">'
            $updated = $true
        }
        if ($content -match "<CardContent>") {
            $content = $content -replace "<CardContent>", '<CardContent className="">'
            $updated = $true
        }
        if ($updated) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Updated: $($file.Name)"
        }
    }
}
