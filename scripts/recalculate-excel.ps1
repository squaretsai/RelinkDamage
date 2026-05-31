param(
  [string]$InputPath = "C:\Users\User\Pictures\WEB\RelinkDamage\reports\zeta-stress-input.xlsx",
  [string]$OutputPath = "C:\Users\User\Pictures\WEB\RelinkDamage\reports\zeta-stress-recalculated.xlsx"
)

$ErrorActionPreference = "Stop"

$inputFull = [System.IO.Path]::GetFullPath($InputPath)
$outputFull = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $inputFull)) {
  throw "找不到輸入檔：$inputFull"
}

$outputDir = Split-Path -Parent $outputFull
if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

if (Test-Path -LiteralPath $outputFull) {
  Remove-Item -LiteralPath $outputFull -Force
}

$tempInput = Join-Path $env:TEMP ("relink-recalc-" + [Guid]::NewGuid().ToString("N") + ".xlsx")
Copy-Item -LiteralPath $inputFull -Destination $tempInput -Force
try { Unblock-File -LiteralPath $tempInput -ErrorAction SilentlyContinue } catch {}

$excel = New-Object -ComObject Excel.Application
$workbook = $null

try {
  $excel.Visible = $true
  $excel.DisplayAlerts = $true
  $excel.AskToUpdateLinks = $false
  try { $excel.AutomationSecurity = 3 } catch {}

  Write-Host "開啟 Excel 檔：$tempInput"
  try {
    $workbook = $excel.Workbooks.Open($tempInput)
  }
  catch {
    Write-Host "一般 Open 失敗，改用修復模式重試..."
    try {
      # 1 = xlRepairFile
      $workbook = $excel.Workbooks.Open($tempInput, 0, $false, 5, "", "", $true, 1, "", $false, $false, 0, $true, $false, 1)
    }
    catch {
      Write-Host "修復模式失敗，改用抽取資料模式重試..."
      # 2 = xlExtractData
      $workbook = $excel.Workbooks.Open($tempInput, 0, $false, 5, "", "", $true, 1, "", $false, $false, 0, $true, $false, 2)
    }
  }
  Write-Host "開始重算..."
  $excel.CalculateFullRebuild()

  while ($excel.CalculationState -ne 0) {
    Start-Sleep -Milliseconds 250
  }

  # 51 = xlOpenXMLWorkbook (.xlsx)
  $workbook.SaveAs($outputFull, 51)
  Write-Host "Excel 重算完成：$outputFull"
}
finally {
  if ($workbook -ne $null) {
    $workbook.Close($false) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
  }
  if ($excel -ne $null) {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  }
  if (Test-Path -LiteralPath $tempInput) {
    Remove-Item -LiteralPath $tempInput -Force -ErrorAction SilentlyContinue
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
