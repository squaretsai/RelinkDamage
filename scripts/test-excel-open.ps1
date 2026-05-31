$ErrorActionPreference = "Stop"

$testPath = "C:\Users\User\Pictures\WEB\RelinkDamage\reports\excel-com-test.xlsx"
if (Test-Path -LiteralPath $testPath) {
  Remove-Item -LiteralPath $testPath -Force
}

$excel = New-Object -ComObject Excel.Application
$workbook = $null

try {
  $excel.Visible = $true
  $excel.DisplayAlerts = $false

  Write-Host "建立測試活頁簿..."
  $workbook = $excel.Workbooks.Add()
  $sheet = $workbook.Worksheets.Item(1)
  $sheet.Range("A1").Value2 = "Relink Excel COM Test"
  $sheet.Range("A2").Value2 = 123
  $sheet.Range("A3").Formula = "=A2*2"
  $workbook.SaveAs($testPath, 51)
  $workbook.Close($false)
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
  $workbook = $null

  Write-Host "重新開啟測試活頁簿..."
  $workbook = $excel.Workbooks.Open($testPath)
  $value = $workbook.Worksheets.Item(1).Range("A3").Value2
  Write-Host "成功，A3 = $value"
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
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
