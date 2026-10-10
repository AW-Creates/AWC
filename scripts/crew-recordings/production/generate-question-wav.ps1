param([Parameter(Mandatory=$true)][string]$Opening,[Parameter(Mandatory=$true)][string]$Followup,[Parameter(Mandatory=$true)][string]$OutputDirectory,[string]$FFmpeg='C:/Program Files/ShareX/ffmpeg.exe')
$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
Add-Type -AssemblyName System.Speech
$taskSpeech=New-Object System.Speech.Synthesis.SpeechSynthesizer
$taskSpeech.SelectVoice('Microsoft David Desktop');$taskSpeech.Rate=1
try{foreach($taskQuestion in @(@{name='opening';text=$Opening},@{name='followup';text=$Followup})){$taskSpeech.SetOutputToWaveFile((Join-Path $OutputDirectory ($taskQuestion.name+'.wav')));$taskSpeech.Speak($taskQuestion.text);$taskSpeech.SetOutputToNull()}}finally{$taskSpeech.Dispose()}
& $FFmpeg -hide_banner -loglevel error -y -f lavfi -i 'anullsrc=r=48000:cl=mono' -i (Join-Path $OutputDirectory 'opening.wav') -i (Join-Path $OutputDirectory 'followup.wav') -filter_complex '[1:a]aresample=48000,adelay=12000:all=1[q1];[2:a]aresample=48000,adelay=40000:all=1[q2];[0:a][q1][q2]amix=inputs=3:duration=first:normalize=0[m]' -map '[m]' -t 80 -c:a pcm_s16le (Join-Path $OutputDirectory 'microphone.wav')
if($LASTEXITCODE -ne 0){throw 'Offline question WAV assembly failed'}
