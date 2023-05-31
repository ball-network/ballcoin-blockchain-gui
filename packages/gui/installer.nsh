!include "nsDialogs.nsh"

; Add our customizations to the finish page
!macro customFinishPage
XPStyle on

Var DetectDlg
Var FinishDlg
Var BallSquirrelInstallLocation
Var BallSquirrelInstallVersion
Var BallSquirrelUninstaller
Var CheckboxUninstall
Var UninstallBallSquirrelInstall
Var BackButton
Var NextButton

Page custom detectOldBallVersion detectOldBallVersionPageLeave
Page custom finish finishLeave

; Add a page offering to uninstall an older build installed into the ballcoin-blockchain dir
Function detectOldBallVersion
  ; Check the registry for old ballcoin-blockchain installer keys
  ReadRegStr $BallSquirrelInstallLocation HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ballcoin-blockchain" "InstallLocation"
  ReadRegStr $BallSquirrelInstallVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ballcoin-blockchain" "DisplayVersion"
  ReadRegStr $BallSquirrelUninstaller HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ballcoin-blockchain" "QuietUninstallString"

  StrCpy $UninstallBallSquirrelInstall ${BST_UNCHECKED} ; Initialize to unchecked so that a silent install skips uninstalling

  ; If registry keys aren't found, skip (Abort) this page and move forward
  ${If} BallSquirrelInstallVersion == error
  ${OrIf} BallSquirrelInstallLocation == error
  ${OrIf} $BallSquirrelUninstaller == error
  ${OrIf} $BallSquirrelInstallVersion == ""
  ${OrIf} $BallSquirrelInstallLocation == ""
  ${OrIf} $BallSquirrelUninstaller == ""
  ${OrIf} ${Silent}
    Abort
  ${EndIf}

  ; Check the uninstall checkbox by default
  StrCpy $UninstallBallSquirrelInstall ${BST_CHECKED}

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $DetectDlg

  ${If} $DetectDlg == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "Uninstall Old Version" "Would you like to uninstall the old version of Ball Blockchain?"

  ${NSD_CreateLabel} 0 35 100% 12u "Found Ball Blockchain $BallSquirrelInstallVersion installed in an old location:"
  ${NSD_CreateLabel} 12 57 100% 12u "$BallSquirrelInstallLocation"

  ${NSD_CreateCheckBox} 12 81 100% 12u "Uninstall Ball Blockchain $BallSquirrelInstallVersion"
  Pop $CheckboxUninstall
  ${NSD_SetState} $CheckboxUninstall $UninstallBallSquirrelInstall
  ${NSD_OnClick} $CheckboxUninstall SetUninstall

  nsDialogs::Show

FunctionEnd

Function SetUninstall
  ; Set UninstallBallSquirrelInstall accordingly
  ${NSD_GetState} $CheckboxUninstall $UninstallBallSquirrelInstall
FunctionEnd

Function detectOldBallVersionPageLeave
  ${If} $UninstallBallSquirrelInstall == 1
    ; This could be improved... Experiments with adding an indeterminate progress bar (PBM_SETMARQUEE)
    ; were unsatisfactory.
    ExecWait $BallSquirrelUninstaller ; Blocks until complete (doesn't take long though)
  ${EndIf}
FunctionEnd

Function finish

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $FinishDlg

  ${If} $FinishDlg == error
    Abort
  ${EndIf}

  GetDlgItem $NextButton $HWNDPARENT 1 ; 1 = Next button
  GetDlgItem $BackButton $HWNDPARENT 3 ; 3 = Back button

  ${NSD_CreateLabel} 0 35 100% 12u "Ball has been installed successfully!"
  EnableWindow $BackButton 0 ; Disable the Back button
  SendMessage $NextButton ${WM_SETTEXT} 0 "STR:Let's Farm!" ; Button title is "Close" by default. Update it here.

  nsDialogs::Show

FunctionEnd

; Copied from electron-builder NSIS templates
Function StartApp
  ${if} ${isUpdated}
    StrCpy $1 "--updated"
  ${else}
    StrCpy $1 ""
  ${endif}
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
FunctionEnd

Function finishLeave
  ; Launch the app at exit
  Call StartApp
FunctionEnd

; Section
; SectionEnd
!macroend
