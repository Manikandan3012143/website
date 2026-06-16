# ==========================================================================
# POWERSHELL LIGHTWEIGHT DEV SERVER (RECONFIGURED FOR MULTIPLE SITES)
# ==========================================================================
# This script starts a local HTTP listener on port 8080 to serve the static
# files of the Student Portfolio Hub, Harin's Portfolio, and Manikandan's Portfolio.

$port = 8080
$scratchDir = "C:\Users\narot\.gemini\antigravity\scratch"

# Create and configure the listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "   MULTI-SITE PORTFOLIO SERVER STARTED" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "Showcase Hub: http://localhost:$port/" -ForegroundColor Yellow
    Write-Host "Harin V Portfolio: http://localhost:$port/harin-v-portfolio/" -ForegroundColor Yellow
    Write-Host "Manikandan Portfolio: http://localhost:$port/manikandan-m-portfolio/" -ForegroundColor Yellow
    Write-Host "Root Directory: $scratchDir" -ForegroundColor Gray
    Write-Host "Press Ctrl + C in this terminal to stop the server." -ForegroundColor Red
    Write-Host "--------------------------------------------------" -ForegroundColor DarkGray

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        
        # Route logic
        $targetPath = $urlPath
        if ($targetPath -eq "/") {
            $targetPath = "/student-portfolio-hub/index.html"
        } elseif ($targetPath -eq "/styles.css" -or $targetPath -eq "/app.js" -or $targetPath -eq "/students.json") {
            $targetPath = "/student-portfolio-hub" + $targetPath
        }
        
        # Guard against directory traversal
        $normalizedPath = $targetPath.Replace("/", "\").TrimStart("\")
        $filePath = [System.IO.Path]::GetFullPath((Join-Path $scratchDir $normalizedPath))
        
        if (!$filePath.StartsWith($scratchDir)) {
            # Directory traversal attempt
            $response.StatusCode = 403
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }
        
        # Handle directory index file resolution
        if (Test-Path $filePath -PathType Container) {
            $filePath = Join-Path $filePath "index.html"
        }
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Identify MIME Type
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "application/octet-stream"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".json" { $contentType = "application/json; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".ico"  { $contentType = "image/x-icon" }
            }
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 200 GET: $urlPath" -ForegroundColor Green
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 404 GET: $urlPath (Mapped to: $filePath)" -ForegroundColor Red
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
