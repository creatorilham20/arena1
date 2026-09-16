# -*- coding: ascii -*-
$ErrorActionPreference = "Continue"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")+";"+
           [System.Environment]::GetEnvironmentVariable("Path","User")+";"+
           "C:\Users\Admin\AppData\Roaming\npm;"+$env:Path
$netlify = "C:\Users\Admin\AppData\Roaming\npm\netlify.cmd"

"=== 1) daftar situs di akun (cari yg nama arena1 / arena1-main) ==="
$raw = (& $netlify sites:list --json 2>&1 | Out-String)
$sites = @()
try {
  $json = $raw | ConvertFrom-Json
  foreach($s in $json){
    $row = [PSCustomObject]@{
      id   = $s.id
      name = $s.name
      url  = $s.ssl_url
      repo = $s.build_settings.repo_url
      state= $s.state
    }
    "site: id=$($row.id) name=$($row.name) repo=$($row.repo)"
    $sites += $row
  }
} catch {
  "gagal_parse_listSites=$($_.Exception.Message)"
  $raw | Select-Object -First 6
}

"=== 2) situs mana yg ter-link ke repo GitHub arena1? ==="
$arena = $sites | Where-Object { $_.repo -match 'arena1' } | Select-Object -First 1
if($arena){
  "ketemu_site_arena1=$($arena.name) id=$($arena.id)"
  $sid = $arena.id
} else {
  "belum_ketemu_repoarena -> cek semua situs yg punya build_settings"
  $sid = ""
}
if(-not $sid -and $sites.Count -gt 0){ $sid = $sites[0].id }

"=== 3) pasang DATABASE_URL dari .env.local ke situs (jika belum ada) ==="
if($sid){
  $db = ""
  if(Test-Path ".env.local"){
    $ln = Get-Content ".env.local" | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
    if($ln){ $db = ($ln -split '=',2)[1] }
  }
  "db_len=$($db.Length)"
  "db_awal=$($db.Substring(0,[Math]::Min(16,$db.Length)))"
  $v = (& $netlify api listEnvVars --data ('{"site_id":"'+$sid+'"}' ) 2>&1 | Out-String)
  if($v -match 'DATABASE_URL'){ "DATABASE_URL=SUDAH ADA" }
  else {
    $set = (& $netlify env:set DATABASE_URL $db --site $sid 2>&1 | Out-String)
    "set_ok=$($set -match 'Set environment variable')"
    $set | Select-Object -First 4
  }
} else { "TIDAK ADA situs yg perlu dideploy ulang -- cek manual" }

"=== 4) trigger deploy utk memakai env baru (build di Linux) ==="
if($sid){
  $dep = (& $netlify deploy --prod --build --dir . 2>&1 | Out-String)
  "deploy_prod_ok=$($dep -match 'Deploy complete|Unique deploy URL|Live Draft URL')"
  $dep -split "`r?`n" | Where-Object { $_ -match 'URL|complete|error|Error|failed' } | Select-Object -First 6
} else { "lewati deploy (tidak ada sid)" }