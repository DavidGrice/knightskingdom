/*
 *         Filename		 : APP_DEFS.H
 *         Author		 : S.T.Ellis
 *         Creation date : 13 Dec 94
 *         Last update   : 27 Aug 96 15:08:25
 *         Version number: 00.087
 *
 *	Function: Definition of various data types and defines which may be used
 *			by the VRT and any applications.
 *
 *	(c) Copyright Superscape VR plc 1995. All rights reserved.
 *
 *-------------------------------------------------------------------------
 *
 *	DECLARATIONS ----------------------------------------------------------
 */

#ifndef	APP_DEFS_INCLUDED

#include	<stdio.h>
#include	<stdlib.h>
#include	<stdarg.h>
#include	<time.h>

#include	"APP_TYPE.H"
#include	"APP_API.H"

/*-------------------------------------------------------------------------
 *
 *	DECLARATIONS ----------------------------------------------------------
 */

extern T_APIVECTORS *API_Vectors,
					 API_Old_Vectors;
extern T_APIRETURN   API_Return;

/*	DEFINED FUNCTIONS -----------------------------------------------------
 */

/*
 * 	Short forms of all the elements in API_Vectors ------------------------
 */

#define	C_Console           (API_Vectors->_C_Console)
#define	C_PlayerView        (API_Vectors->_C_PlayerView)
#define	C_Player            (API_Vectors->_C_Player)
#define	C_ThisPlayer        (API_Vectors->_C_ThisPlayer)
#define	C_MousePos          (API_Vectors->_C_MousePos)
#define	C_Sprite            (API_Vectors->_C_Sprite)
#define	C_UserSprite        (API_Vectors->_C_UserSprite)
#define	C_NumSprites        (API_Vectors->_C_NumSprites)
#define	C_NumUserSprites    (API_Vectors->_C_NumUserSprites)
#define	C_MonoTime          (API_Vectors->_C_MonoTime)
#define	C_ErrorString       (API_Vectors->_C_ErrorString)
#define	C_ErrorAddress      (API_Vectors->_C_ErrorAddress)
#define	C_MessBuffer        (API_Vectors->_C_MessBuffer)
#define	C_WorldBuffer       (API_Vectors->_C_WorldBuffer)
#define	C_ShapeBuffer       (API_Vectors->_C_ShapeBuffer)
#define	C_ConfigBuffer      (API_Vectors->_C_ConfigBuffer)
#define	C_PalBuffer         (API_Vectors->_C_PalBuffer)
#define	C_BackBuffer        (API_Vectors->_C_BackBuffer)
#define	C_ResourceBuffer    (API_Vectors->_C_ResourceBuffer)
#define	C_UserRsrcBuffer    (API_Vectors->_C_UserRsrcBuffer)
#define	C_SpriteBuffer      (API_Vectors->_C_SpriteBuffer)
#define	C_UserSprBuffer     (API_Vectors->_C_UserSprBuffer)
#define	C_Spr0SaveBuffer    (API_Vectors->_C_Spr0SaveBuffer)
#define	C_SprSaveBuffer     (API_Vectors->_C_SprSaveBuffer)
#define	C_UserSprSaveBuf    (API_Vectors->_C_UserSprSaveBuf)
#define	C_FontBuffer        (API_Vectors->_C_FontBuffer)
#define	C_PrefsBuffer       (API_Vectors->_C_PrefsBuffer)
#define	C_UndoBuffer        (API_Vectors->_C_UndoBuffer)
#define	C_ViewPtBuffer      (API_Vectors->_C_ViewPtBuffer)
#define	C_MessBufLength     (API_Vectors->_C_MessBufLength)
#define	C_WorldBufLength    (API_Vectors->_C_WorldBufLength)
#define	C_ShapeBufLength    (API_Vectors->_C_ShapeBufLength)
#define	C_ConfigBufLength   (API_Vectors->_C_ConfigBufLength)
#define	C_PalBufLength      (API_Vectors->_C_PalBufLength)
#define	C_BackBufLength     (API_Vectors->_C_BackBufLength)
#define	C_ResourceBufLength (API_Vectors->_C_ResourceBufLength)
#define	C_UserRsrcBufLength (API_Vectors->_C_UserRsrcBufLength)
#define	C_SpriteBufLength   (API_Vectors->_C_SpriteBufLength)
#define	C_UserSprBufLength  (API_Vectors->_C_UserSprBufLength)
#define	C_FontBufLength     (API_Vectors->_C_FontBufLength)
#define	C_PrefsBufLength    (API_Vectors->_C_PrefsBufLength)
#define	C_UndoBufLength     (API_Vectors->_C_UndoBufLength)
#define	C_ViewPtBufLength   (API_Vectors->_C_ViewPtBufLength)
#define	C_WorldSym          (API_Vectors->_C_WorldSym)
#define	C_ShapeSym          (API_Vectors->_C_ShapeSym)
#define	C_EditBuffer        (API_Vectors->_C_EditBuffer)
#define	C_FilesChanged      (API_Vectors->_C_FilesChanged)
#define	C_UndoHead          (API_Vectors->_C_UndoHead)
#define	C_DevLen            (API_Vectors->_C_DevLen)
#define	C_ConfigLen         (API_Vectors->_C_ConfigLen)
#define	C_WorldLen          (API_Vectors->_C_WorldLen)
#define	C_ShapeLen          (API_Vectors->_C_ShapeLen)
#define	C_PalLen            (API_Vectors->_C_PalLen)
#define	C_BackLen           (API_Vectors->_C_BackLen)
#define	C_MessLen           (API_Vectors->_C_MessLen)
#define	C_ResourceLen       (API_Vectors->_C_ResourceLen)
#define	C_UserRsrcLen       (API_Vectors->_C_UserRsrcLen)
#define	C_SpriteLen         (API_Vectors->_C_SpriteLen)
#define	C_UserSprLen        (API_Vectors->_C_UserSprLen)
#define	C_FontLen           (API_Vectors->_C_FontLen)
#define	C_PrefsLen          (API_Vectors->_C_PrefsLen)
#define	C_DialSaveBuf       (API_Vectors->_C_DialSaveBuf)
#define	C_LastDialName      (API_Vectors->_C_LastDialName)
#define	C_Palette           (API_Vectors->_C_Palette)
#define	C_Stipples          (API_Vectors->_C_Stipples)
#define	C_ColRanges         (API_Vectors->_C_ColRanges)
#define	C_Triggers          (API_Vectors->_C_Triggers)
#define	C_Markers           (API_Vectors->_C_Markers)
#define	C_Counters          (API_Vectors->_C_Counters)
#define	C_InsVal            (API_Vectors->_C_InsVal)
#define	C_InsVal2           (API_Vectors->_C_InsVal2)
#define	C_UserFunc          (API_Vectors->_C_UserFunc)
#define	C_DevsInstalled     (API_Vectors->_C_DevsInstalled)
#define	C_BaseAddress       (API_Vectors->_C_BaseAddress)
#define	C_SinTable          (API_Vectors->_C_SinTable)
#define	C_ErrorMessage      (API_Vectors->_C_ErrorMessage)
#define	C_FuncBuf			(API_Vectors->_C_FuncBuf)
#define	C_FuncBufHead		(API_Vectors->_C_FuncBufHead)
#define	C_FuncBufTail      	(API_Vectors->_C_FuncBufTail)
#define	C_DrawList	        (API_Vectors->_C_DrawList)
#define	C_DrawRoot          (API_Vectors->_C_DrawRoot)
#define	C_DrawAdd           (API_Vectors->_C_DrawAdd)

#define	C_DrawListSize      (API_Vectors->_C_DrawListSize)
#define	C_FacetCount        (API_Vectors->_C_FacetCount)
#define	C_SysMessBuffer     (API_Vectors->_C_SysMessBuffer)
#define	C_SysMessBufLength  (API_Vectors->_C_SysMessBufLength)
#define	C_SysMessLen        (API_Vectors->_C_SysMessLen)
#define	C_SoundBuffer       (API_Vectors->_C_SoundBuffer)
#define	C_SoundBufLength    (API_Vectors->_C_SoundBufLength)
#define	C_SoundLen          (API_Vectors->_C_SoundLen)
#define	C_SoundReturn       (API_Vectors->_C_SoundReturn)
#define	C_SoundDD           (API_Vectors->_C_SoundDevice)			/* Alias */
#define	C_SoundDevice       (API_Vectors->_C_SoundDevice)
#define	C_StartSoundDevice  (API_Vectors->_C_StartSoundDevice)
#define	C_SoundParams       (API_Vectors->_C_SoundParams)
#define	C_SoundName         (API_Vectors->_C_DeviceName[E_DEVSOUND*E_MAXPERDEV+*C_SoundDD])
#define	C_SoundOn           (API_Vectors->_C_NumDevsActive[E_DEVSOUND])
#define	C_CurrentPalette    (API_Vectors->_C_CurrentPalette)
#define	C_ClearColour       (API_Vectors->_C_ClearColour)
#define	C_Activated         (API_Vectors->_C_Activated)
#define	C_AbsTime           (API_Vectors->_C_AbsTime)
#define	C_TextureScale      (API_Vectors->_C_TextureScale)
#define	C_ViewMatrix        (API_Vectors->_C_ViewMatrix)
#define	C_ScreenParams      (API_Vectors->_C_ScreenParams)
#define	C_CopyFlag          (API_Vectors->_C_CopyFlag)
#define	C_ScreenSave        (API_Vectors->_C_ScreenSave)
#define	C_Ambient           (API_Vectors->_C_Ambient)
#define	C_IAmbient          (API_Vectors->_C_IAmbient)
#define	C_MsgHead           (API_Vectors->_C_MsgHead)
#define	C_MsgTail           (API_Vectors->_C_MsgTail)
#define	C_MsgFree           (API_Vectors->_C_MsgFree)
#define	C_SCLFiles          (API_Vectors->_C_SCLFiles)
#define	C_SCLPC             (API_Vectors->_C_SCLPC)
#define	C_SCLDefVarAdd      (API_Vectors->_C_SCLDefVarAdd)
#define	C_SCLResumeAdd      (API_Vectors->_C_SCLResumeAdd)
#define	C_SCLSP             (API_Vectors->_C_SCLSP)
#define	C_SCLRSP            (API_Vectors->_C_SCLRSP)
#define	C_SCLParamIndex     (API_Vectors->_C_SCLParamIndex)
#define	C_SCLError          (API_Vectors->_C_SCLError)
#define	C_SCLType           (API_Vectors->_C_SCLType)
#define	C_SCLStack          (API_Vectors->_C_SCLStack)
#define	C_SCLReturnStack    (API_Vectors->_C_SCLReturnStack)
#define	C_DebugSCL          (API_Vectors->_C_DebugSCL)
#define	C_SCLChkType        (API_Vectors->_C_SCLChkType)
#define	C_SkyCol            (API_Vectors->_C_SkyCol)
#define	C_SkyBands          (API_Vectors->_C_SkyBands)
#define	C_SkyGrad           (API_Vectors->_C_SkyGrad)
#define	C_GndCol            (API_Vectors->_C_GndCol)
#define	C_GndBands          (API_Vectors->_C_GndBands)
#define	C_GndGrad           (API_Vectors->_C_GndGrad)
#define	C_BufferClear       (API_Vectors->_C_BufferClear)
#define	C_Resolution        (API_Vectors->_C_Resolution)
#define	C_DefResolution     (API_Vectors->_C_DefResolution)
#define	C_AngleSize         (API_Vectors->_C_AngleSize)
#define	C_StepSize          (API_Vectors->_C_StepSize)
#define	C_ViewPosition      (API_Vectors->_C_ViewPosition)
#define	C_NumPlayers        (API_Vectors->_C_NumPlayers)
#define	C_CurrentVP         (API_Vectors->_C_CurrentVP)
#define	C_VPType            (API_Vectors->_C_VPType)
#define	C_PropParam         (API_Vectors->_C_PropParam)
#define	C_DiskFlags         (API_Vectors->_C_DiskFlags)
#define	C_Keyboard          (API_Vectors->_C_Keyboard)
#define	C_KeyTable          (API_Vectors->_C_KeyTable)
#define	C_PropReturn        (API_Vectors->_C_PropReturn)
#define	C_PropAxes          (API_Vectors->_C_PropAxes)
#define	C_PropDevice        (API_Vectors->_C_PropDD)
#define	C_StartPropDevice   (API_Vectors->_C_StartPropDevice)
#define	C_StartPropId       (API_Vectors->_C_StartPropId)

#define	C_PropName          (API_Vectors->_C_DeviceName[E_DEVPROP*E_MAXPERDEV+*C_PropDD])
#define	C_PropDial          (API_Vectors->_C_DeviceDial[E_DEVPROP*E_MAXPERDEV+*C_PropDD])

#define	C_PropId            (API_Vectors->_C_DeviceID[E_DEVPROP*E_MAXPERDEV+*C_PropDD])
#define	C_PropOn            (API_Vectors->_C_NumDevsActive[E_DEVPROP])
#define	C_PropData          (API_Vectors->_C_PropData)
#define	C_Year              (API_Vectors->_C_Year)
#define	C_Month             (API_Vectors->_C_Month)
#define	C_Day               (API_Vectors->_C_Day)
#define	C_Hour              (API_Vectors->_C_Hour)
#define	C_Minute            (API_Vectors->_C_Minute)
#define	C_Second            (API_Vectors->_C_Second)
#define	C_LayerFlags        (API_Vectors->_C_LayerFlags)
#define	C_DetailLevel       (API_Vectors->_C_DetailLevel)
#define	C_Light             (API_Vectors->_C_Light)
#define	C_SunLight          (API_Vectors->_C_SunLight)
#define	C_NumLights         (API_Vectors->_C_NumLights)
#define	C_WhereAmI          (API_Vectors->_C_WhereAmI)
#define	C_Increment         (API_Vectors->_C_Increment)
#define	C_IncStep           (API_Vectors->_C_IncStep)
#define	C_Failed            (API_Vectors->_C_Failed)
#define	C_PrinterBuffer     (API_Vectors->_C_PrinterBuffer)
#define	C_PrinterBufLength  (API_Vectors->_C_PrinterBufLength)
#define	C_ClipBoard         (API_Vectors->_C_ClipBoard)
#define	C_ClipOwner         (API_Vectors->_C_ClipOwner)
#define	C_ClipLen           (API_Vectors->_C_ClipLen)
#define	C_BackPos           (API_Vectors->_C_BackPos)
#define	C_DevPath           (API_Vectors->_C_DevPath)
// #define	C_DevFile           (API_Vectors->_C_DevFile)
#define	C_ConfigPath        (API_Vectors->_C_ConfigPath)
#define	C_ConfigFile        (API_Vectors->_C_ConfigFile)
#define	C_WorldPath         (API_Vectors->_C_WorldPath)
#define	C_WorldFile         (API_Vectors->_C_WorldFile)
#define	C_ShapePath         (API_Vectors->_C_ShapePath)
#define	C_ShapeFile         (API_Vectors->_C_ShapeFile)
#define	C_BackPath          (API_Vectors->_C_BackPath)
#define	C_BackFile          (API_Vectors->_C_BackFile)
#define	C_SoundPath         (API_Vectors->_C_SoundPath)
#define	C_SoundFile         (API_Vectors->_C_SoundFile)
#define	C_SysMessPath       (API_Vectors->_C_SysMessPath)
#define	C_SysMessFile       (API_Vectors->_C_SysMessFile)
#define	C_MessPath          (API_Vectors->_C_MessPath)
#define	C_MessFile          (API_Vectors->_C_MessFile)
#define	C_ResourcePath      (API_Vectors->_C_ResourcePath)
#define	C_ResourceFile      (API_Vectors->_C_ResourceFile)
#define	C_UserRsrcPath      (API_Vectors->_C_UserRsrcPath)
#define	C_UserRsrcFile      (API_Vectors->_C_UserRsrcFile)
#define	C_PalPath           (API_Vectors->_C_PalPath)
#define	C_PalFile           (API_Vectors->_C_PalFile)
#define	C_SpritePath        (API_Vectors->_C_SpritePath)
#define	C_SpriteFile        (API_Vectors->_C_SpriteFile)
#define	C_UserSprPath       (API_Vectors->_C_UserSprPath)
#define	C_UserSprFile       (API_Vectors->_C_UserSprFile)
#define	C_FontPath          (API_Vectors->_C_FontPath)
#define	C_FontFile          (API_Vectors->_C_FontFile)
#define	C_PrefsPath         (API_Vectors->_C_PrefsPath)
#define	C_PrefsFile         (API_Vectors->_C_PrefsFile)
#define	C_BackName          (API_Vectors->_C_BackName)
#define	C_NumDialogues      (API_Vectors->_C_NumDialogues)
#define	C_NumUserDials      (API_Vectors->_C_NumUserDials)
#define	C_PropMenu          (API_Vectors->_C_PropMenu)
#define	C_OldPalette        (API_Vectors->_C_OldPalette)
#define	C_RangeOn           (API_Vectors->_C_RangeOn)
#define	C_FirstPal          (API_Vectors->_C_FirstPal)
#define	C_LastPal           (API_Vectors->_C_LastPal)
#define	C_Triggers2         (API_Vectors->_C_Triggers2)
#define	C_TimerA            (API_Vectors->_C_TimerA)
#define	C_TimerB            (API_Vectors->_C_TimerB)
#define	C_TimerC            (API_Vectors->_C_TimerC)
#define	C_TimerD            (API_Vectors->_C_TimerD)
#define	C_ShapeAdd          (API_Vectors->_C_ShapeAdd)
#define	C_SysMess           (API_Vectors->_C_SysMess)
#define	C_Message           (API_Vectors->_C_Message)
#define	C_FuncNames         (API_Vectors->_C_FuncNames)
#define	C_FuncNameSize      (API_Vectors->_C_FuncNameSize)

#define	C_KeyboardDD   		(API_Vectors->_C_KeyboardDD)
#define	C_MouseDD      		(API_Vectors->_C_MouseDD)
#define	C_JoyDD        		(API_Vectors->_C_JoyDD)
#define	C_GraphicsDD   		(API_Vectors->_C_GraphicsDD)
#define	C_TimerDD      		(API_Vectors->_C_TimerDD)
#define	C_PropDD       		(API_Vectors->_C_PropDD)
#define	C_NetworkDD    		(API_Vectors->_C_NetworkDD)
#define	C_DeviceName   		(API_Vectors->_C_DeviceName)
#define	C_DeviceDial   		(API_Vectors->_C_DeviceDial)
#define	C_DeviceEnabled		(API_Vectors->_C_DeviceEnabled)
#define	C_DeviceActive 		(API_Vectors->_C_DeviceActive)
#define	C_DeviceSetup  		(API_Vectors->_C_DeviceSetup)
#define	C_NumDevsActive		(API_Vectors->_C_NumDevsActive)
#define	C_DeviceID     		(API_Vectors->_C_DeviceID)
#define	C_VersionMajor		(API_Vectors->_C_VersionMajor)
#define	C_VersionMinor		(API_Vectors->_C_VersionMinor)
#define	C_VersionRev		(API_Vectors->_C_VersionRev)
#define	C_VersionDate		(API_Vectors->_C_VersionDate)

#define	C_ProductCode		(API_Vectors->_C_ProductCode)

#define	E_PCODEVRT			"VRT"
#define	E_PCODEVIS			"VIS"

#define	C_DevInstall		(API_Vectors->_C_DevInstall)
#define	C_PropButtons		(API_Vectors->_C_PropButtons)
#define	C_SerialDD			(API_Vectors->_C_SerialDD)

#define	C_MouseMode			(API_Vectors->_C_MouseMode)
#define	C_MouseMode2		(API_Vectors->_C_MouseMode2)
#define C_MouseHomePos		(API_Vectors->_C_MouseHomePos)

#define C_SuppressFileErr	(API_Vectors->_C_SuppressFileErr)
#define C_MonitorMode		(API_Vectors->_C_MonitorMode)

#define C_SCLFunctions		(API_Vectors->_C_SCLFunctions)
#define C_RegSCLFunctions	(API_Vectors->_C_RegSCLFunctions)

#define	C_CNVPass           (API_Vectors->_C_CNVPass)
#define	C_CNV_FName         (API_Vectors->_C_CNV_FName)

#define	C_CNV3DFace_Cnt     (API_Vectors->_C_CNV3DFace_Cnt)
#define	C_CNV3DFace_List    (API_Vectors->_C_CNV3DFace_List)

#define	C_CNV_Arc_Iterations (API_Vectors->_C_CNV_Arc_Iterations)

#define	C_CNVElement_NAME     (API_Vectors->_C_CNVElement_NAME)
#define	C_CNVElementList		(API_Vectors->_C_CNVElementList)
#define	C_CNVElementCnt		(API_Vectors->_C_CNVElementCnt)

#define	C_CNVWorld_Scale    (API_Vectors->_C_CNVWorld_Scale)
#define	C_CNVLayers         (API_Vectors->_C_CNVLayers)
#define	C_CNVLayerCnt       (API_Vectors->_C_CNVLayerCnt)
#define	C_CNVLast_Child     (API_Vectors->_C_CNVLast_Child)

#define	C_CNVRotXCen		(API_Vectors->_C_CNVRotXCen)
#define	C_CNVRotYCen		(API_Vectors->_C_CNVRotYCen)
#define	C_CNVRotZCen		(API_Vectors->_C_CNVRotZCen)

#define	C_CNVProcess        (API_Vectors->_C_CNVProcess)
#define	C_CNVFlags          (API_Vectors->_C_CNVFlags)

#define	C_CNVPercentage_Complete (API_Vectors->_C_CNVPercentage_Complete)

/*
 * Windows specific variables
 */

#ifdef _WINDOWS
#define	C_hMainFrame         (API_Vectors->_C_hMainFrame)
#define	C_hView              (API_Vectors->_C_hView)
#define	C_hDC                (API_Vectors->_C_hDC)
#define C_WinOpenDialog      (API_Vectors->_C_WinOpenDialog)
#endif

/*
 * VisNet specific variables
 */

#ifdef _WINDOWS
#define C_hwndPlugin		(API_Vectors->_C_hwndPlugin)
#endif

// Extra stuff to webify SCL file functions
#define	C_SCLFileFlags      (API_Vectors->_C_SCLFileFlags)

/*
 * New stuff for VRT 5-00
 */
#define C_ExtraConfig		(API_Vectors->_C_ExtraConfig)
#define C_PrefsExtraConfig	(API_Vectors->_C_PrefsExtraConfig)
#define C_ObjChanged		(API_Vectors->_C_ObjChanged)
#define C_SelectedObject	(API_Vectors->_C_SelectedObject)
#define C_EditorPrefs		(API_Vectors->_C_EditorPrefs)
#define C_Manip3D			(API_Vectors->_C_Manip3D);
#define	C_SystemInfo        (API_Vectors->_C_SystemInfo)

/*
 * New stuff for Long Filename support (5-50)
 */
#define	C_LongConfigPath		(API_Vectors->_C_LongConfigPath)
#define	C_LongConfigFile		(API_Vectors->_C_LongConfigFile)
#define	C_LongWorldPath         (API_Vectors->_C_LongWorldPath)
#define	C_LongWorldFile         (API_Vectors->_C_LongWorldFile)
#define	C_LongShapePath         (API_Vectors->_C_LongShapePath)
#define	C_LongShapeFile         (API_Vectors->_C_LongShapeFile)
#define	C_LongBackPath			(API_Vectors->_C_LongBackPath)
#define	C_LongBackFile			(API_Vectors->_C_LongBackFile)
#define	C_LongSoundPath         (API_Vectors->_C_LongSoundPath)
#define	C_LongSoundFile         (API_Vectors->_C_LongSoundFile)
#define	C_LongMessPath			(API_Vectors->_C_LongMessPath)
#define	C_LongMessFile			(API_Vectors->_C_LongMessFile)
#define	C_LongResourcePath		(API_Vectors->_C_LongResourcePath)
#define	C_LongResourceFile		(API_Vectors->_C_LongResourceFile)
#define	C_LongUserRsrcPath		(API_Vectors->_C_LongUserRsrcPath)
#define	C_LongUserRsrcFile		(API_Vectors->_C_LongUserRsrcFile)
#define	C_LongPalPath			(API_Vectors->_C_LongPalPath)
#define	C_LongPalFile			(API_Vectors->_C_LongPalFile)
#define	C_LongUserSprPath		(API_Vectors->_C_LongUserSprPath)
#define	C_LongUserSprFile		(API_Vectors->_C_LongUserSprFile)
#define	C_LongFontPath			(API_Vectors->_C_LongFontPath)
#define	C_LongFontFile			(API_Vectors->_C_LongFontFile)
#define	C_LongPrefsPath         (API_Vectors->_C_LongPrefsPath)
#define	C_LongPrefsFile         (API_Vectors->_C_LongPrefsFile)
#define	C_LongAppPath	        (API_Vectors->_C_LongAppPath)
#define	C_LongAppFile			(API_Vectors->_C_LongAppFile)
#define	C_LongConvPath			(API_Vectors->_C_LongConvPath)
#define	C_LongConvFile			(API_Vectors->_C_LongConvFile)
#define	C_LongConvModPath		(API_Vectors->_C_LongConvModPath)
#define	C_LongConvModFile		(API_Vectors->_C_LongConvModFile)

/*
 * New stuff for VRT 5-60
 */
#define	C_ZPlane				(API_Vectors->_C_ZPlane)
#define	C_ZPlaneScale			(API_Vectors->_C_ZPlaneScale)
#define	C_Plane					(API_Vectors->_C_Plane)
#define	C_ViewList				(API_Vectors->_C_ViewList)
#define	C_List					(API_Vectors->_C_List)
#define	C_MaxChunk				(API_Vectors->_C_MaxChunk)

/*
 * Vectors into VRT (called by API)
 */

extern void Init(T_WORLDCHUNK *Root,T_SHAPECHUNK *Shape);
extern void	InitSCL(T_WORLDCHUNK *SCL);
extern void	InitViewPoints(T_WORLDCHUNK *p);

extern void	Process(T_WORLDCHUNK *Tree);
extern void	MatMult(T_MATRIX m1,T_MATRIX m2, T_MATRIX Result);
extern void	MatMake(short XRot, short YRot, short ZRot, T_MATRIX Result);
extern void	MatMakeInv(short XRot, short YRot, short ZRot, T_MATRIX Result);
extern void	RotatePoint(T_POINTREC3D *Point, T_MATRIX Matrix,short Type);
extern void	RotatePointLong(T_LONGVECTOR *Point,T_MATRIX Matrix,short Type);

extern T_DCOBJECT *SortTree(void);

extern void	Draw(void *Tree);
extern void	ClearScreen(void);
extern void	ClearWindow(void);
extern void	ScreenDraw(void);
extern void DrawPolygon(T_GRPOLYGON *Polygon);
extern void	DrawRectangle(short x1,short y1,short x2,short y2,
		 			      unsigned char Colour);
extern void	DrawInstruments(short WindowNumber);
extern void Text(short x,short y,unsigned char FGColour,
		 		 unsigned char BGColour,short FontID, short MaxLen,
		 		 short Align, unsigned char Flags,char *String);

extern void	UpdateWorld(T_WORLDCHUNK *Tree);
extern void	UpdateViewPoint(void);

extern void	ExecuteSCL(T_WORLDCHUNK *Tree);
extern short Execute(unsigned char *Conditions);
extern void PushN(short t, long v);
extern void PushF(short t, float v);
extern void PushP(short t, void *v);
extern long PopN(short t);
extern float PopF(short t);

extern long	BLoad(char *FileName,void *LoadAddress,long MaxLength);
extern long	BSave(char *FileName,void *SaveAddress,long Length);
extern long	GetFileLength(char *FileName);
extern char **GetFileList(char *PathName, char *Buffer, short BufLen);
extern char *FileSelector(char *Path,char *FileName,char *Title,long FileTypes);
extern void	SplitPath(char *FileName,char *Path,char *File);
extern long	LoadSS(char *FileName,char *LoadAddress,long MaxLength,
		 	char *Type,char Mode);
extern long	SaveSS(char *FileName,char *SaveAddress,long Length,
		 	char *Type,char Mode);
extern long	SaveVRT(char *FileName,short Flags,char Mode);
extern long	GetLenSS(char *FileName,char *Type,char Mode);
extern char *GetFileName(char *FileName,char *Type);

extern char *LongToDec(long n,char *String,short Length);
extern char *LongToHex(long n,char *String,short Length);
extern char *LongToBin(long n,char *String,short Length);
extern char *AscToLong(long *n,char *String,short Base,char MaxChar);
extern char *DecToLong(long *n,char *String);
extern char *HexToLong(long *n,char *String);
extern char *BinToLong(long *n,char *String);
extern char *EnumToAsc(long n,char *String,short Length,char *EnumString);

extern long	Random(long Seed);
extern short ArcSin(short Value);
extern short ArcCos(short Value);
extern short ArcTan(long Num,long Denom);

extern void	FindFacet(short pX, short pY, T_OBJFAC *pObjFac,
		 	  unsigned short Exclude);

extern void	AbsPosition(long *x,long *y,long*z,short Object,char Lock,
		 		short *xr,short *yr,short *zr);
extern short FindBearing(long x,long y,long z,short *XRot);
extern void	FindOffset(short Object, short PointNum, long *x,long *y,long *z);
extern void	SetViewpoint(short VPNum);

extern T_PICKITEM *Pick(char *Title,T_PICKITEM *PickList,short Mode, T_PICKITEM * (*FilterFunction)(T_PICKITEM *));
extern short SaveScreen(short Format);
extern unsigned short EditLine(T_GRTEXT *Text,short CursPos,short MaxLen,
		 			    char Flag);
extern unsigned short EditScreen(T_GRTEXT *Text,long CursPos,long MaxLen,
		 		  		  short MaxWidth, short ScrnHeight);

extern void *FindDial(char *DialName);
extern void	DrawPropMenu(char *DialName);
extern long	Dialogue(char *DialName);
extern long	Alert(char *String, short Type, short Buttons);
extern long	PopUpDialogue(char *DialName);
extern long	CentreDialogue(char *DialName);
extern void	FillInShortCuts(char *DialName);
extern void	UpdateDialogue(char *DialName, short Item, short MaxKids);

extern short Compile(char *String,unsigned char *SCL,T_OBJSYM *Comment,
		 		T_OBJSYM *VarName);
extern short Decompile(unsigned char *SCL,char *Text,char *EndText,
		 		T_OBJSYM *Comment, T_OBJSYM *VarName);

extern short ReInsert(char  *Ptr, long Length, long PrevLength,
		              char  *End, char *Buffer, long BufUsed);
extern void	GetFunctions(void);
extern void	WriteFunc(long Function,short Param);

extern long	ProcessFunctions(void(*Func)(long));
extern void	ObeyFunction(long FuncNum);

extern void	MouseOn(void);
extern void	MouseOff(void);

extern void	_Terminate(short ErrorCode);
extern T_WORLDCHUNK *ChunkAdd(short Object,unsigned short ChkType);
extern short RegisterSCL(T_COMPILEREC *CRec,void __vrtcall (*Function)(void));
extern short UnRegisterSCL(short OpCode);

#define	UnknownFunction	 	(API_Vectors->_UnknownFunction)
#define	UnknownInstr	 	(API_Vectors->_UnknownInstr)
#define	UnknownDialItem	 	(API_Vectors->_UnknownDialItem)
#define	UnknownWChunk	 	(API_Vectors->_UnknownWChunk)
#define	UnknownSChunk	 	(API_Vectors->_UnknownSChunk)

#define	VecB4Init           (API_Vectors->_VecB4Init)
#define	VecAFInit           (API_Vectors->_VecAFInit)
#define	VecVisEntry         (API_Vectors->_VecVisEntry)
#define	VecB4GetFunc        (API_Vectors->_VecB4GetFunc)
#define	VecAFGetFunc        (API_Vectors->_VecAFGetFunc)
#define	VecB4DoFunc         (API_Vectors->_VecB4DoFunc)
#define	VecAFDoFunc         (API_Vectors->_VecAFDoFunc)
#define	VecB4Update         (API_Vectors->_VecB4Update)
#define	VecB4SCL            (API_Vectors->_VecB4SCL)
#define	VecB4Render         (API_Vectors->_VecB4Render)
#define	VecB4Process        (API_Vectors->_VecB4Process)
#define	VecB4Sort           (API_Vectors->_VecB4Sort)
#define	VecB4Instrs         (API_Vectors->_VecB4Instrs)
#define	VecB4ScreenSwap     (API_Vectors->_VecB4ScreenSwap)
#define	VecB4Draw           (API_Vectors->_VecB4Draw)
#define	VecAFDraw           (API_Vectors->_VecAFDraw)
#define	VecAFRender         (API_Vectors->_VecAFRender)
#define	VecVisExit		    (API_Vectors->_VecVisExit)

#define	ImageAlloc          (API_Vectors->_ImageAlloc)
#define	ImageFree           (API_Vectors->_ImageFree)
#define	ImageLoad           (API_Vectors->_ImageLoad)
#define	ImageSave           (API_Vectors->_ImageSave)
#define	ImagePalette        (API_Vectors->_ImagePalette)



/* 
 * Extern for function to fetch address of entity chunk
 */
extern T_ENTITY * GetEntityFromObject(short nObject);

extern void *PopP(short t);

extern short ResizeScreen(char Resolution);
extern void VisError(char *String);

extern void	AddDrawChunk(short Type,void *Data,short Length,char Flush,short Buffer);
extern void	AddRectangle(short x1,short y1,short x2,short y2,
		 				 	 unsigned char Colour,unsigned char Type);
extern void	AddText(short x,short y,unsigned char FGColour,
		 				 	 unsigned char BGColour,short FontID,
		 					 short MaxLen,short Align,unsigned char Flags,
		 					 char *String);

extern char *LongToAsc(long n,char *String,short Length,long *Power,
		 					 short NumPowers);

extern long	SquareRoot(long n);

extern long	SaveWorld		(void);
extern long	LoadWorld		(void);
extern long	ClearWorld		(void);
extern long	SaveShape		(void);
extern long	LoadShape		(void);
extern long	ClearShape		(void);
extern long	SavePalette		(void);
extern long	LoadPalette		(void);
extern long	ClearPalette	(void);
extern long	SaveUserSprites	(void);
extern long	LoadUserSprites	(void);
extern long	ClearUserSprites(void);
extern long	SaveUserRsrc	(void);
extern long	LoadUserRsrc	(void);
extern long	ClearUserRsrc	(void);
extern long	SaveMessages	(void);
extern long	LoadMessages	(void);
extern long	ClearMessages	(void);
extern long	SaveSounds		(void);
extern long	LoadSounds		(void);
extern long	ClearSounds		(void);
extern long	LoadBackdrop	(short Number);
extern long	SaveConfig		(void);
extern long	SavePrefs		(void);

extern void	 PrintScreen	(void);
extern void	 ChoosePrinter	(void);

extern T_OBJSYM *GetSym(short ObjNum,short Chk);
extern T_OBJSYM *GetShapeSym(short ShpNum,short Chk);
extern T_OBJSYM *GetSymList(short Number,short Chk,T_OBJSYM *s);

extern short GetSCLLength(unsigned char *SCL);

extern void	 FlushUndoBuf(void);

extern void	 CheckRepeat(long Function,short Param);

extern short RegisterDev(T_STDFUNCPTR *Functions,short Type);
extern short ReRegisterDev(T_STDFUNCPTR *Functions,short Type,short Slot);
extern short RegisterDevFunc(T_STDFUNCPTR Function,short Type,short Slot,short EntryNum);

extern short CreateVRTPalette(char *pBuffer,short PalNum);
extern short DeleteVRTPalette(short PalNum);
extern short CreateVRTObject(char *pBuffer,char *pName,short ObjNum);
extern short DeleteVRTObject(short ObjNum);
extern short CreateVRTShape(char *pBuffer,char *pName,short ShpNum);
extern short DeleteVRTShape(short ShpNum);
extern short CreateVRTWindow(T_CONSOLE *pBuffer,short WinNum);
extern short DeleteVRTWindow(short WinNum);
extern short CreateVRTInstrument(T_INSTRUMENT *pBuffer,short Console,short InstNum);
extern short DeleteVRTInstrument(short Console,short InstNum);
extern short CreateVRTIcon(T_ICON *pBuffer,short IconTable,short IconNum);
extern short DeleteVRTIcon(short IconTable,short IconNum);
extern short CreateVRTSprite(T_GRSPRINST *pBuffer,char *pName,short SprNum);
extern short DeleteVRTSprite(short SprNum);
extern short CreateVRTDial(char *pBuffer,char *pName);
extern short DeleteVRTDial(char *pName);
extern short CreateVRTSound(T_SOUNDREC *pBuffer,char *pName,short SndNum);
extern short DeleteVRTSound(short SndNum);

extern T_DOSVECTOR  GetDosVector(short VecNum);
extern void  		SetDosVector(short VecNum,T_DOSVECTOR FuncPtr);

extern short 		RegisterShare(T_APISHARE *ShareInfo);
extern T_APISHARE * GetShare(char *Name);

extern short	ImageLoadLibrary(void);
extern short	FFT(float *Real, float *Imag, long Pwr, short Dir);

extern long  	Conv_Element(T_ELEMENT *pElement);
extern short 	Conv_CheckBreak(void);
extern void 	Conv_Fatal(char *Error);
extern void		Conv_ShowProgress(void);
extern void 	Conv_UpdateProgress(void);
extern void		Conv_HideProgress(void);
extern void 	Conv_CleanUpElement(void);
extern void 	Conv_InitElement(void);
extern void    *Conv_ElementAllocMem(size_t size, long Length);
extern void    *Conv_ElementReallocMem(void *p, size_t size);
extern T_ELEMENT *Conv_FindElement(char *Name);
extern T_STANDARD *Conv_MakeWorldObject(T_ELEMENT *Element, long MyParent, long PrevSib, T_ELEMENT *ParElement);
extern T_ELEMENT *Conv_NewElement(void);
extern void 	Conv_ElementDeallocMem(void *p);
extern void		Conv_Message(char *Message);
extern long		Conv_RemapColour(unsigned char r, unsigned char g, unsigned char b, unsigned char a);
extern T_CNVFACET * Conv_NewFacet(short NumPoints);
extern void		Conv_RemoveFacet(long FacetNo);
extern T_CNVLAYER *Conv_NewLayer(void);
extern void		Conv_RemoveLayer(long LayerNo);
extern T_ELEMENT *Conv_NewElement(void);
extern void		Conv_RemoveElement(char *ElementName);
extern T_CHILD *Conv_NewChild(char *ElementName);
extern void		Conv_RemoveChild(char *ElementName, long ChildNo);

extern void *	CreateTextBlock(char *Title,char *Text,long MaxLen,unsigned short Flags);
extern long		EditTextBlock(void* Handle);
extern void		SetTextBlockCursor(void *Handle,long CursorPos,long BlockStart,long BlockEnd);
extern void		SetTextBlockErrorStrings(void *Handle,char *ErrorString1,char *ErrorString2,char *ErrorString3);
extern void		DestroyTextBlock(void *Handle);

extern short	CloseDialogue(char *DialName);

extern void		RelPosition(long *x,long *y,long *z,short Object);
extern void		RelRotation(short *XR,short *YR,short *ZR,short Object);
extern void		Orientation(short obj,short *XR,short *YR,short *ZR);
extern void		Horizon(void);

extern short	CreateVRTSpriteWithPalette(T_GRSPRINST *pBuffer,char *pName,short SprNum,unsigned char *pPal);
extern int		RemoveSpriteColour(unsigned int Colour,int SprNum,int bUseFirst16);

/*
 * Old (previous) Vectors into VRT (called by API)
 */
extern void	OldUnknownFunction(long FuncNum);
extern void	OldUnknownInstr   (T_INSTRUMENT *Ins);
extern void	OldUnknownDialItem(void *DialItem);
extern void	OldUnknownWChunk  (T_WORLDCHUNK *Chunk);
extern void	OldUnknownSChunk  (T_SHAPECHUNK *Chunk);

extern void	OldVecB4Init      (void);
extern void	OldVecAFInit      (void);
extern void	OldVecVisEntry	  (void);
extern void	OldVecB4GetFunc   (void);
extern void	OldVecAFGetFunc   (void);
extern void	OldVecB4DoFunc    (void);
extern void	OldVecAFDoFunc    (void);
extern void	OldVecB4Update    (void);
extern void	OldVecB4SCL       (void);
extern void	OldVecB4Render    (void);
extern void	OldVecB4Process   (void);
extern void	OldVecB4Sort      (void);
extern void	OldVecB4Instrs    (void);
extern void	OldVecB4ScreenSwap(void);
extern void	OldVecB4Draw      (void);
extern void	OldVecAFDraw      (void);
extern void	OldVecAFRender    (void);
extern void	OldVecVisExit	  (void);

/*
 * 	Device driver calls ---------------------------------------------------
 */

#define	ActiveDevice(d,i)	(C_DeviceActive [E_MAXPERDEV*(d)+(i)])
#define	DeviceEnabled(d,i)	(C_DeviceEnabled[E_MAXPERDEV*(d)+(i)])

#define	KbInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVKEYBOARD+(*C_KeyboardDD)])[E_KBINSTALL])
#define	KbSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVKEYBOARD+(*C_KeyboardDD)])[E_KBSETUP])
#define	KbDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVKEYBOARD+(*C_KeyboardDD)])[E_KBDEINSTALL])
#define	KbKeyReady		((C_BaseAddress[E_MAXPERDEV*E_DEVKEYBOARD+(*C_KeyboardDD)])[E_KBKEYREADY])
#define	KbReadKey		((C_BaseAddress[E_MAXPERDEV*E_DEVKEYBOARD+(*C_KeyboardDD)])[E_KBREADKEY])

#define	MsInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVMOUSE+(*C_MouseDD)])[E_MSINSTALL])
#define	MsSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVMOUSE+(*C_MouseDD)])[E_MSSETUP])
#define	MsDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVMOUSE+(*C_MouseDD)])[E_MSDEINSTALL])

#define	JyInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVJOY+(*C_JoyDD)])[E_JYINSTALL])
#define	JySetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVJOY+(*C_JoyDD)])[E_JYSETUP])
#define	JyDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVJOY+(*C_JoyDD)])[E_JYDEINSTALL])
#define	JyGetPos		((C_BaseAddress[E_MAXPERDEV*E_DEVJOY+(*C_JoyDD)])[E_JYGETPOS])

#define	GrInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRINSTALL])
#define	GrSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETUP])
#define	GrDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDEINSTALL])
#define	GrDrawScan		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWSCAN])
#define	GrDrawLine		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWLINE])
#define	GrDrawText		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWTEXT])
#define	GrDrawBackDrop	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWBACKDROP])
#define	GrDrawSprite	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWSPRITE])
#define	GrUndrawSprite	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRUNDRAWSPRITE])
#define	GrScreenDone	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSCREENDONE])
#define	GrSetPalette	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETPALETTE])
#define	GrDrawPolygon	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWPOLYGON])
#define	GrDrawSorted	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWSORTED])
#define	GrDrawUnsorted	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWUNSORTED])
#define	GrDrawModel		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWMODEL])
#define	GrSetStipples	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETSTIPPLES])
#define	GrSetSprites	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETSPRITES])
#define	GrPreCopy		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRPRECOPY])
#define	GrPickObject	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRPICKOBJ])
#define	GrUpdateObject	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRUPDATEOBJ])
#define	GrDrawHorizon	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRDRAWHORIZON])
#define	GrGetBackBuffDC	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GETBACKBUFFDC])
#define	GrRelBackBuffDC	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_RELBACKBUFFDC])
#define	GrSetConfig		((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETCONFIG])
#define	GrSetOneSprite	((C_BaseAddress[E_MAXPERDEV*E_DEVGRAPHICS+(*C_GraphicsDD)])[E_GRSETONESPRITE])

#define	TmInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMINSTALL])
#define	TmSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMSETUP])
#define	TmDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMDEINSTALL])
#define	TmAddList		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMADDLIST])
#define	TmRemList		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMREMLIST])
#define	TmFastTimer		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMFASTTIMER])
#define	TmSlowTimer		((C_BaseAddress[E_MAXPERDEV*E_DEVTIMER+(*C_TimerDD)])[E_TMSLOWTIMER])

#define	PrInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVPROP+(*C_PropDD)])[E_PRINSTALL])
#define	PrSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVPROP+(*C_PropDD)])[E_PRSETUP])
#define	PrDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVPROP+(*C_PropDD)])[E_PRDEINSTALL])
#define	PrGetPos		((C_BaseAddress[E_MAXPERDEV*E_DEVPROP+(*C_PropDD)])[E_PRGETPOS])

#define	SdInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDINSTALL])
#define	SdSetUp			((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDSETUP])
#define	SdDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDDEINSTALL])
#define	SdPlaySound		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDPLAYSOUND])
#define	SdShutup		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDSHUTUP])
#define	SdRecord		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDRECORD])
#define	SdModify		((C_BaseAddress[E_MAXPERDEV*E_DEVSOUND+(*C_SoundDevice)])[E_SDMODIFY])

#define	SrInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRINSTALL])
#define	SrSetUp	   		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRSETUP])
#define	SrDeInstall		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRDEINSTALL])
#define	SrSetUpPort		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRSETUPPORT])
#define	SrReleasePort	((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRRELEASEPORT])
#define	SrSendBytes		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRSENDBYTES])
#define	SrGetBytes		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRGETBYTES])
#define	SrSetCallBack	((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRSETCALLBACK])
#define	SrClrCallBack	((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRCLRCALLBACK])
#define	SrFlushBuf		((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRFLUSHBUF])
#define	SrGetPortInfo	((C_BaseAddress[E_MAXPERDEV*E_DEVSERIAL+(0)])[E_SRGETPORTINFO])

/*
 *	Pseudo-functions
 */

#define	Sin(a)	C_SinTable[(long)((unsigned short)(a)) >>3]
#define	Cos(a)	C_SinTable[(long)((unsigned short)((a)+16384)) >>3]

#define	XPer(p)	(((p).z>0)?(short)(C_Console->WindXMid+((long)(C_Console->WindWidth) *(long)((p).x))/(p).z):C_Console->WindXMid)
#define	YPer(p)	(((p).z>0)?(short)(C_Console->WindYMid-((long)(C_Console->WindHeight)*(long)((p).y))/(p).z):C_Console->WindYMid)

#define	ChunkAdd2(o,c)	(((((unsigned short)(o))<E_MAXOBJECTS) && ((c)<=C_MaxChunk[o]))?(C_List[o][c]):NULL)

/*
 * 	Additional structures
 */

#define	E_MAXPATHLEN	80

typedef struct
{
	char 			Name[E_MAXPATHLEN];
} T_FILENAME;

typedef struct
{
	long 			Function[5][4];
} T_JOYTABLE;

typedef struct
{
	short			FuncNum;
	unsigned char	SCLProg[1];
} T_USERFUNC;


/*
 *  Dummy T_CNVSUBOBJECT structure.
 */

struct T_CNVSUBOBJECT
{
	short	Type;
	short	Hidden[9];
	double	Hidden2[3];
	short	Hidden3[2];
	short  *Hidden4;
};

/*
 * 	Defines for SCL table indices.
 *
 *	Instructions whose sole purpose is to place constants onto the stack,
 *	define variables, or which affect flow-of-control are not included.
 *
 *	The waitf instruction (or waitfs, waitmsg, stopf or resetf) will have
 *	effect only on returning to the main SCL execution code. They cannot be
 *	used within an application for multi-frame execution.
 *
 *	The name of a #defined symbol is E_SCL followed by the name of the SCL
 *	instruction. Where difficult characters are used, they are substituted
 *	strictly according to the following table:
 *
 *		?	q
 *		+	plus
 *		-	minus
 *		=	eq
 *		<	less
 *		>	great
 *		!	not
 *		~	tilde
 *		&	and
 *		|	or
 *		^	xor
 *		*	star
 *		/	slash
 * 		%	mod
 *
 *	Where multiple meanings exist (eg *), one name is altered, and a comment
 *	indicates the name as derived above.
 */

#define	E_SCLME			0x2F
#define	E_SCLPLUS		0x30
#define	E_SCLMINUS		0x31	/* Subtract - see also E_SCLNEGATE	*/
#define	E_SCLMULTIPLY	0x32	/* Multiply - see also E_SCLSTAR	*/
#define	E_SCLSLASH		0x33
#define	E_SCLMOD		0x34
#define	E_SCLLESSLESS	0x36
#define	E_SCLGREATGREAT	0x37
#define	E_SCLRANSEED	0x39
#define	E_SCLRANDOM		0x3A
#define	E_SCLSIN		0x3B
#define	E_SCLCOS		0x3C
#define	E_SCLASN		0x3D
#define	E_SCLACS		0x3E
#define	E_SCLATN		0x3F
#define	E_SCLBREE		0x40
#define	E_SCLDEG		0x41
#define	E_SCLEQ			0x42
#define	E_SCLSQRT		0x43
#define	E_SCLNEGATE		0x44	/* Unary - see also E_SCLMINUS		*/
#define	E_SCLABS		0x45
#define	E_SCLSGN		0x46
#define	E_SCLLIMIT		0x47
#define	E_SCLEXTEND		0x48
#define	E_SCLEXTBYTE	0x49
#define	E_SCLPLUSEQ		0x4B
#define	E_SCLMINUSEQ	0x4C
#define	E_SCLANDEQ		0x4D
#define	E_SCLOREQ		0x4E
#define	E_SCLXOREQ		0x4F
#define	E_SCLEQEQ		0x50
#define	E_SCLNOTEQ		0x51
#define	E_SCLLESS		0x52
#define	E_SCLGREAT		0x53
#define	E_SCLLESSEQ		0x54
#define	E_SCLGREATEQ	0x55
#define	E_SCLNOT		0x56
#define	E_SCLINP		0x5C
#define	E_SCLINPW		0x5D
#define	E_SCLOUTP		0x5E
#define	E_SCLOUTPW		0x5F
#define	E_SCLAND		0x60
#define	E_SCLOR			0x61
#define	E_SCLXOR		0x62
#define	E_SCLTILDE		0x63
#define	E_SCLSETB		0x64
#define	E_SCLRESB		0x65
#define	E_SCLCHGB		0x66
#define	E_SCLTSTB		0x67
#define	E_SCLANDAND		0x68
#define	E_SCLOROR		0x69
#define	E_SCLNOTNOT		0x6A
#define	E_SCLXORXOR		0x6B
#define	E_SCLINDEX		0x6F
#define	E_SCLSTAR		0x71	/* Unary - see also E_SCLMULTIPLY	*/
#define	E_SCLPLUSPLUS	0x74
#define	E_SCLMINUSMINUS	0x75
#define	E_SCLNEG		0x76
#define	E_SCLWRITE		0x7B
#define	E_SCLOBJECT		0x7C
#define	E_SCLINT	 	0x7D
#define	E_SCLFIX	 	0x7E
#define	E_SCLSETTYPE	0x7F
#define	E_SCLWAITF		0x80
#define	E_SCLSTOPF		0x81
#define	E_SCLRESETF		0x82
#define	E_SCLWAITFS		0x84
#define	E_SCLSET		0x88
#define	E_SCLRESET		0x89
#define	E_SCLCHANGE		0x8A
#define	E_SCLFORCE		0x8B
#define	E_SCLMARKER		0x8C
#define	E_SCLCOUNTER	0x8D
#define	E_SCLVAR		0x8E
#define	E_SCLINLOOP		0x8F
#define	E_SCLOUTLOOP	0x90
#define	E_SCLLOOPC		0x91
#define	E_SCLSHARE		0x92
#define	E_SCLFRMRATE	0x93
#define	E_SCLDISOPTS	0x94
#define	E_SCLSETVTYPE	0x95
#define	E_SCLGVAR		0x96
#define	E_SCLPRINTSTR	0x97
#define	E_SCLBUFCLR		0x98
#define	E_SCLDETAIL		0x99
#define	E_SCLSKYCOL		0x9A
#define	E_SCLGNDCOL		0x9B
#define	E_SCLMESSAGE	0x9C
#define	E_SCLVRTIME		0x9D
#define	E_SCLPALETTEQ	0x9E
#define	E_SCLPRINT		0x9F
#define	E_SCLINSTR		0xA0
#define	E_SCLINS2		0xA1
#define	E_SCLSETPAL		0xA2
#define	E_SCLSETPALS	0xA3
#define	E_SCLROTPALS	0xA4
#define	E_SCLRESPALS	0xA5
#define	E_SCLGETPAL		0xA6
#define	E_SCLUPDATE		0xA7
#define	E_SCLMIDI		0xA9
#define	E_SCLINSX		0xAA
#define	E_SCLINSY		0xAB
#define	E_SCLINSW		0xAC
#define	E_SCLINSH		0xAD
#define	E_SCLFADEPAL	0xAE
#define	E_SCLPALETTE	0xAF
#define	E_SCLGETVP		0xB0
#define	E_SCLSETVP		0xB1
#define	E_SCLVATTACH	0xB2
#define	E_SCLVINSIDE	0xB3
#define	E_SCLXVIEW		0xB4
#define	E_SCLYVIEW		0xB5
#define	E_SCLZVIEW		0xB6
#define	E_SCLXVIEWR		0xB7
#define	E_SCLYVIEWR		0xB8
#define	E_SCLZVIEWR		0xB9
#define	E_SCLXVOFF		0xBA
#define	E_SCLYVOFF		0xBB
#define	E_SCLZVOFF		0xBC
#define	E_SCLXVROFF		0xBD
#define	E_SCLYVROFF		0xBE
#define	E_SCLZVROFF		0xBF
#define	E_SCLVPLOCK		0xC0
#define	E_SCLINSIDEQ	0xC1
#define	E_SCLVCONTROL	0xC2
#define	E_SCLVTYPE		0xC3
#define	E_SCLTIME		0xC4
#define	E_SCLDATE		0xC5
#define	E_SCLHITOBJ		0xC6
#define	E_SCLHITCUBE	0xC7
#define	E_SCLTRIGQ		0xC8
#define	E_SCLACTIVATE	0xC9
#define	E_SCLATTRQ   	0xCA
#define	E_SCLHITQ		0xCB
#define	E_SCLWAIT		0xCC
#define	E_SCLSETTRIG	0xCD
#define	E_SCLCLRTRIG	0xCE
#define	E_SCLACTOBJ	 	0xCF
#define	E_SCLAUTO	 	0xD0
#define	E_SCLMANUAL	 	0xD1
#define	E_SCLAUTOQ	 	0xD2
#define	E_SCLCOUPLE	 	0xD3
#define	E_SCLDECOUPLE 	0xD4
#define	E_SCLCOUPLEDQ 	0xD5
#define	E_SCLKILL	 	0xD6
#define	E_SCLUNKILL	 	0xD7
#define	E_SCLDEADQ	 	0xD8
#define	E_SCLVIS		0xD9
#define	E_SCLINVIS	 	0xDA
#define	E_SCLVISQ	 	0xDB
#define	E_SCLTOGVIS	 	0xDC
#define	E_SCLSTOP	 	0xDD
#define	E_SCLRESTART	0xDE
#define	E_SCLSTOPPEDQ 	0xDF
#define	E_SCLSTOPC	 	0xE0
#define	E_SCLRESTARTC 	0xE1
#define	E_SCLCSTOPQ	 	0xE2
#define	E_SCLSTOPA	 	0xE3
#define	E_SCLRESTARTA 	0xE4
#define	E_SCLASTOPQ	 	0xE5
#define	E_SCLSETLAYER 	0xE6
#define	E_SCLLAYER	 	0xE7
#define	E_SCLEXECUTE	0xE8
#define	E_SCLCALL	 	0xE9
#define	E_SCLOBEY	 	0xEA
#define	E_SCLPROP	 	0xEB
#define	E_SCLANGLE	 	0x100
#define	E_SCLDIST2	 	0x102
#define	E_SCLMDIST	 	0x103
#define	E_SCLVDIST	 	0x104
#define	E_SCLCHILD	 	0x108
#define	E_SCLSIBLING	0x109
#define	E_SCLPARENT	 	0x10A
#define	E_SCLAPOS	 	0x10B
#define	E_SCLAROT	 	0x10C
#define	E_SCLAPOSROT	0x10D
#define	E_SCLANGLE3D	0x10E
#define	E_SCLOFFSET	 	0x10F
#define	E_SCLXPOS	 	0x110
#define	E_SCLYPOS	 	0x111
#define	E_SCLZPOS	 	0x112
#define	E_SCLXSIZE	 	0x113
#define	E_SCLYSIZE	 	0x114
#define	E_SCLZSIZE	 	0x115
#define	E_SCLOFLAGS	 	0x116
#define	E_SCLDFLAGS	 	0x117
#define	E_SCLTYPE	 	0x119
#define	E_SCLRELINK	 	0x11A
#define	E_SCLMOVABLE	0x11B
#define	E_SCLUSER	 	0x11C
#define	E_SCLNUMUSERS 	0x11D
#define	E_SCLSETPPOS	0x11E
#define	E_SCLCUSER	 	0x11F
#define	E_SCLNCOLS	 	0x120
#define	E_SCLCOLOR	 	0x121
#define	E_SCLCOLOUR	 	0x121
#define	E_SCLSETCOL	 	0x122
#define	E_SCLSETCOLS	0x123
#define	E_SCLROTCOLS	0x124
#define	E_SCLRESCOLS	0x125
#define	E_SCLADOPT	 	0x126
#define	E_SCLFACATTR	0x127
#define	E_SCLNICOLS	 	0x128
#define	E_SCLICOLOUR	0x129
#define	E_SCLNUMOBJS	0x12B
#define	E_SCLANICOL	 	0x12C
#define	E_SCLGPARENT	0x12D
#define	E_SCLGCHILD	 	0x12E
#define	E_SCLGSIBLING	0x12F
#define	E_SCLXROT	 	0x130
#define	E_SCLYROT	 	0x131
#define	E_SCLZROT	 	0x132
#define	E_SCLIXROT	 	0x133
#define	E_SCLIYROT	 	0x134
#define	E_SCLIZROT	 	0x135
#define	E_SCLXCENT	 	0x136
#define	E_SCLYCENT	 	0x137
#define	E_SCLZCENT	 	0x138
#define	E_SCLCOUPLED	0x139
#define	E_SCLINSIDE	 	0x13A
#define	E_SCLCLOSEST	0x13B
#define	E_SCLPREVSIB	0x13C
#define	E_SCLNUMCHILD	0x13D
#define	E_SCLNUMSIBS	0x13E
#define	E_SCLFIRSTSIB	0x13F
#define	E_SCLVISDIS	 	0x140
#define	E_SCLINVDIS 	0x141
#define	E_SCLREPLACE	0x142
#define	E_SCLNOBEY	 	0x143
#define	E_SCLACTCHILD	0x144
#define	E_SCLXANGV	 	0x148
#define	E_SCLYANGV	 	0x149
#define	E_SCLZANGV	 	0x14A
#define	E_SCLIXANGV	 	0x14B
#define	E_SCLIYANGV	 	0x14C
#define	E_SCLIZANGV	 	0x14D
#define	E_SCLSETPAN	 	0x14E
#define	E_SCLANIMODE	0x150
#define	E_SCLIANIMODE 	0x151
#define	E_SCLCFRAME	 	0x152
#define	E_SCLFCEL	 	0x153
#define	E_SCLLCEL	 	0x154
#define	E_SCLPHASE	 	0x155
#define	E_SCLANIVEL	 	0x156
#define	E_SCLIANIVEL	0x157
#define	E_SCLCCEL	 	0x15A
#define	E_SCLVFRAME	 	0x15B
#define	E_SCLIVFRAME	0x15C
#define	E_SCLPHASEF	 	0x15D
#define	E_SCLPOW		0x160
#define	E_SCLLOG		0x161
#define	E_SCLLOG10	 	0x162
#define	E_SCLEXP		0x163
#define	E_SCLFABS	 	0x164
#define	E_SCLFSIN	 	0x165
#define	E_SCLFCOS	 	0x166
#define	E_SCLFTAN	 	0x167
#define	E_SCLFASIN	 	0x168
#define	E_SCLFACOS	 	0x169
#define	E_SCLGVEL	 	0x16A
#define	E_SCLOBJON	 	0x16C
#define	E_SCLOBJABOVE	0x16D
#define	E_SCLFATAN	 	0x16E
#define	E_SCLFATAN2	 	0x16F
#define	E_SCLSOUND	 	0x170
#define	E_SCLMODVOL	 	0x171
#define	E_SCLMODPAN	 	0x172
#define	E_SCLMODPITCH	0x173
#define	E_SCLSOUNDQ	 	0x174
#define	E_SCLJUMPBY	 	0x175
#define	E_SCLJUMPTO	 	0x176
#define	E_SCLMOVEBY	 	0x177
#define	E_SCLMOVETO	 	0x178
#define	E_SCLFIRST	 	0x17B
#define	E_SCLTIMERA	 	0x17C
#define	E_SCLTIMERB	 	0x17D
#define	E_SCLTIMERC	 	0x17E
#define	E_SCLTIMERD	 	0x17F
#define	E_SCLFOPEN	 	0x180
#define	E_SCLFCLOSE	 	0x181
#define	E_SCLFREAD	 	0x182
#define	E_SCLFWRITE	 	0x183
#define	E_SCLFSEEK	 	0x184
#define	E_SCLFTELL	 	0x185
#define	E_SCLFPUTC	 	0x186
#define	E_SCLFGETC	 	0x187
#define	E_SCLFPUTS	 	0x188
#define	E_SCLFSEL	 	0x189
#define	E_SCLREMOVE	 	0x18A
#define	E_SCLRENAME	 	0x18B
#define	E_SCLSETDRIVE	0x18C
#define	E_SCLFIRE	 	0x190
#define	E_SCLSHOOTV	 	0x191
#define	E_SCLSHOOTO	 	0x192
#define	E_SCLTIMG	 	0x193
#define	E_SCLOBJNAME	0x194
#define	E_SCLSHPNAME	0x195
#define	E_SCLSNDNAME	0x196
#define	E_SCLIMGNAME	0x197
#define	E_SCLTEXT	 	0x198
#define	E_SCLALERT	 	0x199
#define	E_SCLDIALOG  	0x19A
#define	E_SCLDIALOGUE	0x19A
#define	E_SCLSXSIZE	 	0x1A0
#define	E_SCLSYSIZE	 	0x1A1
#define	E_SCLSZSIZE	 	0x1A2
#define	E_SCLSXOFF	 	0x1A3
#define	E_SCLSYOFF	 	0x1A4
#define	E_SCLSZOFF	 	0x1A5
#define	E_SCLNUMTXRS	0x1A6
#define	E_SCLTDETAIL	0x1A7
#define	E_SCLXBEND	 	0x1A8
#define	E_SCLYBEND	 	0x1A9
#define	E_SCLZBEND	 	0x1AA
#define	E_SCLIXBEND	 	0x1AB
#define	E_SCLIYBEND	 	0x1AC
#define	E_SCLIZBEND	 	0x1AD
#define	E_SCLFBEND	 	0x1AE
#define	E_SCLLBEND	 	0x1AF
#define	E_SCLCBEND	 	0x1B0
#define	E_SCLTPSIZE	 	0x1B1
#define	E_SCLITPSIZE	0x1B2
#define	E_SCLTIMGREF	0x1B3
#define	E_SCLITIMGREF	0x1B4
#define	E_SCLTXSCALE	0x1B5
#define	E_SCLITXSCALE	0x1B6
#define	E_SCLTYSCALE	0x1B7
#define	E_SCLSPMESS		0x1B8
#define	E_SCLSPSPRITE	0x1B9
#define	E_SCLSPIMGREF	0x1B9
#define	E_SCLSPTEXT		0x1BA
#define	E_SCLITYSCALE	0x1BB
#define	E_SCLTXOFF	 	0x1BC
#define	E_SCLITXOFF	 	0x1BD
#define	E_SCLTYOFF	 	0x1BE
#define	E_SCLITYOFF	 	0x1BF
#define	E_SCLP1		 	0x1C1
#define	E_SCLP2		 	0x1C2
#define	E_SCLP3		 	0x1C3
#define	E_SCLP4		 	0x1C4
#define	E_SCLP5		 	0x1C5
#define	E_SCLP6		 	0x1C6
#define	E_SCLP7		 	0x1C7
#define	E_SCLCXSIZE	 	0x1C8
#define	E_SCLCYSIZE	 	0x1C9
#define	E_SCLCZSIZE	 	0x1CA
#define	E_SCLCXOFF	 	0x1CB
#define	E_SCLCYOFF	 	0x1CC
#define	E_SCLCZOFF	 	0x1CD
#define	E_SCLICXSIZE	0x1CE
#define	E_SCLICYSIZE	0x1CF
#define	E_SCLICZSIZE	0x1D0
#define	E_SCLICXOFF	 	0x1D1
#define	E_SCLICYOFF	 	0x1D2
#define	E_SCLICZOFF	 	0x1D3
#define	E_SCLIXSIZE	 	0x1D4
#define	E_SCLIYSIZE	 	0x1D5
#define	E_SCLIZSIZE	 	0x1D6
#define	E_SCLIXPOS	 	0x1D8
#define	E_SCLIYPOS	 	0x1D9
#define	E_SCLIZPOS	 	0x1DA
#define	E_SCLMOUSEX	 	0x1DC
#define	E_SCLMOUSEY	 	0x1DD
#define	E_SCLMOUSEB	 	0x1DE
#define	E_SCLMTYPE	 	0x1E0
#define	E_SCLIMTYPE	 	0x1E1
#define	E_SCLGRAV	 	0x1E4
#define	E_SCLIGRAV	 	0x1E5
#define	E_SCLCLIMB	 	0x1E6
#define	E_SCLICLIMB	 	0x1E7
#define	E_SCLXDRIVE	 	0x1E8
#define	E_SCLIXDRIVE	0x1E9
#define	E_SCLYDRIVE	 	0x1EA
#define	E_SCLIYDRIVE	0x1EB
#define	E_SCLZDRIVE	 	0x1EC
#define	E_SCLIZDRIVE	0x1ED
#define	E_SCLXEXTERN	0x1EE
#define	E_SCLIXEXTERN	0x1EF
#define	E_SCLYEXTERN	0x1F0
#define	E_SCLIYEXTERN	0x1F1
#define	E_SCLZEXTERN	0x1F2
#define	E_SCLIZEXTERN	0x1F3
#define	E_SCLXMFORCE	0x1F4
#define	E_SCLIXMFORCE	0x1F5
#define	E_SCLYMFORCE	0x1F6
#define	E_SCLIYMFORCE	0x1F7
#define	E_SCLZMFORCE	0x1F8
#define	E_SCLIZMFORCE	0x1F9
#define	E_SCLXGFRIC	 	0x1FA
#define	E_SCLIXGFRIC	0x1FB
#define	E_SCLYGFRIC	 	0x1FC
#define	E_SCLIYGFRIC	0x1FD
#define	E_SCLZGFRIC	 	0x1FE
#define	E_SCLIZGFRIC	0x1FF
#define	E_SCLLOADIMG	0x200
#define	E_SCLLOADMSG	0x201
#define	E_SCLLOADPAL	0x202
#define	E_SCLLOADPIC	0x203
#define	E_SCLLOADRSC	0x204
#define	E_SCLLOADSND	0x205
#define	E_SCLLOADFNT	0x206
#define	E_SCLDISPLAY	0x207
#define	E_SCLXMXVEL	 	0x20C
#define	E_SCLIXMXVEL	0x20D
#define	E_SCLYMXVEL	 	0x20E
#define	E_SCLIYMXVEL	0x20F
#define	E_SCLZMXVEL	 	0x210
#define	E_SCLIZMXVEL	0x211
#define	E_SCLFUEL	 	0x21D
#define	E_SCLIFUEL	 	0x21E
#define	E_SCLXREST	 	0x21F
#define	E_SCLYREST	 	0x220
#define	E_SCLZREST	 	0x221
#define	E_SCLIXREST	 	0x222
#define	E_SCLIYREST	 	0x223
#define	E_SCLIZREST	 	0x224
#define	E_SCLXVEL	 	0x225
#define	E_SCLYVEL	 	0x226
#define	E_SCLZVEL	 	0x227
#define	E_SCLIXVEL	 	0x228
#define	E_SCLIYVEL	 	0x229
#define	E_SCLIZVEL	 	0x22A
#define	E_SCLSENDMSG	0x230
#define	E_SCLWAITMSG	0x231
#define	E_SCLMSGRDYQ	0x232
#define	E_SCLFLUSH	 	0x233
#define	E_SCLFUNCKEY	0x238
#define	E_SCLSETKTAB	0x239
#define	E_SCLUPDCONS	0x23A
#define	E_SCLBMEDGE	 	0x23E
#define	E_SCLIBMEDGE	0x23F
#define	E_SCLBRIGHT	 	0x240
#define	E_SCLIBRIGHT	0x241
#define	E_SCLAMBIENT	0x242
#define	E_SCLIAMBIENT	0x243
#define	E_SCLBEAM	 	0x244
#define	E_SCLIBEAM	 	0x245
#define	E_SCLDISPERS	0x246
#define	E_SCLIDISPERS	0x247
#define	E_SCLLXOFF	 	0x248
#define	E_SCLLYOFF	 	0x249
#define	E_SCLLZOFF	 	0x24A
#define	E_SCLILXOFF	 	0x24B
#define	E_SCLILYOFF	 	0x24C
#define	E_SCLILZOFF	 	0x24D
#define	E_SCLLXROT	 	0x24E
#define	E_SCLLYROT	 	0x24F
#define	E_SCLLZROT	 	0x250
#define	E_SCLILXROT	 	0x251
#define	E_SCLILYROT	 	0x252
#define	E_SCLILZROT	 	0x253
#define	E_SCLGETLSCOL	0x254
#define	E_SCLSETLSCOL	0x255
#define	E_SCLLSON		0x256
#define	E_SCLLSOFF		0x257
#define	E_SCLRELIGHT	0x258
#define	E_SCLLSFLAGS	0x259
#define	E_SCLRESLSCOL	0x25A
#define	E_SCLLSONQ		0x25B
#define	E_SCLILSONQ		0x25C
#define	E_SCL_GETTYPE	0x260
#define	E_SCL_1STSEL	0x261
#define	E_SCL_NEXTSEL	0x262
#define	E_SCL_SELECT	0x263
#define	E_SCL_DESELEC	0x264
#define	E_SCL_OBEYSHP	0x265
#define	E_SCL_RELX	 	0x266
#define	E_SCL_RELY	 	0x267
#define	E_SCL_RELZ	 	0x268
#define	E_SCL_GEOMP1	0x269
#define	E_SCL_GEOMP2	0x26A
#define	E_SCL_GEOMMUL 	0x26B
#define	E_SCL_GEOMSHF 	0x26C
#define	E_SCL_NEWREL	0x26D
#define	E_SCL_NEWGEOM 	0x26E
#define	E_SCL_NEWFAC	0x26F
#define	E_SCL_MKDYN		0x270
#define	E_SCL_MKSTAT	0x271
#define	E_SCL_GTOR	 	0x272
#define	E_SCL_CLRSEL	0x273
#define	E_SCL_REDRAW	0x274
#define	E_SCL_SHPCOL	0x275
#define	E_SCL_CLRSHP	0x276
#define	E_SCL_MESHFAC	0x277
#define	E_SCL_FACATTR	0x278
#define	E_SCL_SETCEL	0x279
#define	E_SCL_CEL		0x27A
#define	E_SCL_NUMCELS	0x27B
#define	E_SCL_1STFAC	0x27C
#define	E_SCL_NEXTFAC	0x27D
#define	E_SCL_NUMPTS	0x27E
#define	E_SCL_FACPNT	0x27F
#define	E_SCLGETCONS	0x280
#define	E_SCLGETWIN	 	0x280
#define	E_SCLSETCONS	0x281
#define	E_SCLSETWIN	 	0x281
#define	E_SCLNEXTCONS 	0x282
#define	E_SCLNEXTWIN	0x282
#define	E_SCLSETCSIZE 	0x283
#define	E_SCLSETWSIZE 	0x283
#define	E_SCLXCONSIZE 	0x284
#define	E_SCLXWINSIZE 	0x284
#define	E_SCLYCONSIZE 	0x285
#define	E_SCLYWINSIZE 	0x285
#define	E_SCLXCONCENT 	0x286
#define	E_SCLXWINCENT 	0x286
#define	E_SCLYCONCENT 	0x287
#define	E_SCLYWINCENT 	0x287
#define	E_SCLIXCNSIZE 	0x288
#define	E_SCLIXWNSIZE 	0x288
#define	E_SCLIYCNSIZE 	0x289
#define	E_SCLIYWNSIZE 	0x289
#define	E_SCLIXCNCENT 	0x28A
#define	E_SCLIXWNCENT 	0x28A
#define	E_SCLIYCNCENT 	0x28B
#define	E_SCLIYWNCENT 	0x28B
#define	E_SCLXSCALE	 	0x28C
#define	E_SCLYSCALE	 	0x28D
#define	E_SCLZSCALE	 	0x28E
#define	E_SCLZOOM	 	0x28E
#define	E_SCLASCALE	 	0x28F
#define	E_SCLCONSOFF	0x290
#define	E_SCLWINOFF	 	0x290
#define	E_SCLCONSON	 	0x291
#define	E_SCLWINON	 	0x291
#define	E_SCLCONSONQ	0x292
#define	E_SCLWINONQ	 	0x292
#define	E_SCLSETACT	 	0x293
#define	E_SCLCLRWIN	 	0x294
#define	E_SCLCLRSCRN	0x295
#define	E_SCLDRAWRECT 	0x296
#define	E_SCLRESDEC	 	0x298
#define	E_SCLRESINC	 	0x299
#define	E_SCLSCREENH	0x29A
#define	E_SCLSCREENW	0x29B
#define	E_SCLATOF	 	0x29C
#define	E_SCLATOL	 	0x29D
#define	E_SCLFTOA	 	0x29E
#define	E_SCLLTOA	 	0x29F
#define	E_SCLSTRCAT	 	0x2A0
#define	E_SCLSTRCHR	 	0x2A1
#define	E_SCLSTRCMP	 	0x2A2
#define	E_SCLSTRCPY	 	0x2A3
#define	E_SCLSTRCSPN	0x2A4
#define	E_SCLSTRLEN	 	0x2A5
#define	E_SCLSTRNCAT	0x2A6
#define	E_SCLSTRNCMP	0x2A7
#define	E_SCLSTRNCPY	0x2A8
#define	E_SCLSTRPBRK	0x2A9
#define	E_SCLSTRRCHR	0x2AA
#define	E_SCLSTRSPN	 	0x2AB
#define	E_SCLSTRSTR	 	0x2AC
#define	E_SCLLOADVRT	0x2B0
#define	E_SCLDUP		0x2B1
#define	E_SCLCREATE	 	0x2B2
#define	E_SCLDELETE	 	0x2B3
#define	E_SCLEXPORT	 	0x2B4
#define	E_SCLIMPORT	 	0x2B5
#define	E_SCLGETMSIMG	0x2B6
#define	E_SCLSETMSIMG	0x2B7
#define	E_SCLSETMSPOS	0x2B8
#define	E_SCLMOUSEOFF	0x2B9
#define	E_SCLMOUSEON	0x2BA
#define	E_SCLTANG	 	0x2BB
#define	E_SCLINTANG	 	0x2BC
#define	E_SCLTANGQ	 	0x2BD
#define	E_SCLPRODUCT	0x2BE
#define	E_SCLTIMEWARP	0x2BF
#define	E_SCLDDEOPEN	0x2C0
#define	E_SCLDDECLOSE	0x2C1
#define	E_SCLDDEGET		0x2C2
#define	E_SCLDDESEND	0x2C3
#define	E_SCLDDELINK	0x2C4
#define	E_SCLDDEUNLNK	0x2C5
#define	E_SCLDDENEWQ	0x2C6
#define	E_SCLDDEEXEC	0x2C7
#define	E_SCLVERMAJOR	0x2C8
#define	E_SCLVERMINOR	0x2C9
#define	E_SCLVERBUILD	0x2CA
#define	E_SCLISVRT		0x2CB
#define	E_SCLISNET		0x2CC
#define	E_SCLISDOS		0x2CD
#define	E_SCLISWIN		0x2CE
#define	E_SCLISUNIX		0x2CF
#define	E_SCLSHEXEC		0x2D0
#define	E_SCLISBIGEND	0x2D1
#define	E_SCLISZBUF		0x2D2
#define	E_SCLGETAMB		0x2D3
#define	E_SCLGETIAMB	0x2D4
#define	E_SCLSETAMB		0x2D5
#define	E_SCLRESAMB		0x2D6
#define	E_SCLEXFLAGS	0x2D7
#define	E_SCLGETZMODE	0x2D8
#define	E_SCLSETZMODE	0x2D9
#define	E_SCLISSMOOTH	0x2DA
#define	E_SCLGETFOG		0x2DB
#define	E_SCLGETIFOG	0x2DC
#define	E_SCLSETFOG		0x2DD
#define	E_SCLRESFOG		0x2DE
#define	E_SCLGETFMODE	0x2DF
#define	E_SCLSETFMODE	0x2E0
#define	E_SCLFOGSTART	0x2E1
#define	E_SCLFOGEND		0x2E2
#define	E_SCLFOGDEN		0x2E3
#define	E_SCLIFOGSTRT	0x2E4
#define	E_SCLIFOGEND	0x2E5
#define	E_SCLIFOGDEN	0x2E6
#define	E_SCLISFOG		0x2E7
#define	E_SCLPRPCHNGQ	0x2E8
#define	E_SCLPROCHNG	0x2E9
#define	E_SCLPROPERTY	0x2EA
#define	E_SCLNUMGRCFG	0x2EB
#define	E_SCLGETGRCFG	0x2EC
#define	E_SCLSETGRCFG	0x2ED
#define	E_SCLGRINFO		0x2EE
#define	E_SCLGETHORIZ	0x2EF
#define	E_SCLSETHORIZ	0x2F0
#define	E_SCLAUTOSND	0x2F1
#define	E_SCLSETLOOP	0x2F2
#define	E_SCLISDO3D		0x2F3
#define	E_SCLISWEBMAS	0x2F4
#define	E_SCLORIENT		0x2F5
#define	E_SCLCMBNROT	0x2F6
#define	E_SCLINVROT		0x2F7
#define	E_SCLRPOS		0x2F8
#define	E_SCLRROT		0x2F9
#define	E_SCLBEARING	0x2FA
#define	E_SCLACTFAC		0x2FB
#define	E_SCLBARSHOWN	0x2FC
#define	E_SCLSHOWBAR	0x2FD
#define E_SCLPROPI		0x2FE
#define E_SCLPROPDLG	0x2FF
#define E_SCLIS3DCNTL	0x300
#define E_SCLSHIN		0x301
#define E_SCLTRANSP		0x302
#define E_SCLMFLAGS		0x303
#define E_SCLISHIN		0x304
#define E_SCLITRANSP	0x305
#define E_SCLIMFLAGS	0x306
#define E_SCLPIMGREF	0x307
#define E_SCLPFLAGS		0x308
#define E_SCLPXOFF		0x309
#define E_SCLPYOFF		0x30A
#define E_SCLPZOFF		0x30B
#define E_SCLPXSIZE		0x30C
#define E_SCLPYSIZE		0x30D
#define E_SCLPZSIZE		0x30E
#define E_SCLIPIMGREF	0x30F
#define E_SCLIPFLAGS	0x310
#define E_SCLIPXOFF		0x311
#define E_SCLIPYOFF		0x312
#define E_SCLIPZOFF		0x313
#define E_SCLIPXSIZE	0x314
#define E_SCLIPYSIZE	0x315
#define E_SCLIPZSIZE	0x316
#define E_SCLPCOL		0x317
#define E_SCLIPCOL		0x318
#define E_SCLSYSINFO	0x319

#define E_SCLFFLAGS		0x31A
#define E_SCLFOBJECT	0x31B
#define E_SCLFDENS		0x31C
#define E_SCLFCOL		0x31D
#define E_SCLIFFLAGS	0x31E
#define E_SCLIFOBJECT	0x31F
#define E_SCLIFDENS		0x320
#define E_SCLIFCOL		0x321
#define E_SCLHIMGREF	0x322
#define E_SCLHCOL		0x323
#define E_SCLIHIMGREF	0x324
#define E_SCLIHCOL		0x325
#define E_SCLHFLAGS		0x326
#define E_SCLIHFLAGS	0x327

#define E_SCLOLCOL		0x328
#define E_SCLOLWID3D	0x329
#define E_SCLOLEXT3D	0x32A
#define E_SCLOLWID2D	0x32B
#define E_SCLOLEXT2D	0x32C
#define E_SCLOLEXTPC	0x32D
#define E_SCLOLIMGREF	0x32E
#define E_SCLMIMGREF	0x32F
#define E_SCLMBRIGHT	0x330
#define E_SCLIOLCOL		0x331
#define E_SCLIOLWID3D	0x332
#define E_SCLIOLEXT3D	0x333
#define E_SCLIOLWID2D	0x334
#define E_SCLIOLEXT2D	0x335
#define E_SCLIOLEXTPC	0x336
#define E_SCLIOLIMGRF	0x337
#define E_SCLIMIMGREF	0x338
#define E_SCLIMBRIGHT	0x339

#define E_SCLFIREEVNT	0x4EE
#define E_SCLAMSETPOS	0x4EF
#define E_SCLGESTURE	0x4F0
#define E_SCLAMQUERY	0x4F1
#define E_SCLAMMODPAN	0x4F2
#define E_SCLAMMODVOL	0x4F3
#define E_SCLAMERROR	0x4F4
#define E_SCLAMSTOP		0x4F5
#define E_SCLAMPAUSE	0x4F6
#define E_SCLAMPLAY		0x4F7
#define E_SCLAMCLOSE	0x4F8
#define E_SCLAMOPEN		0x4F9
#define E_SCLOPENBROW	0x4FA
#define E_SCLBROWCAPS	0x4FB
#define E_SCLSCLSTATBAR	0x4FC
#define E_SCLLINKTO		0x4FD


#define	APP_DEFS_INCLUDED
#endif
/*-------------------------------------------------------------------------
 */
