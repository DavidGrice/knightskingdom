/*
 *         Filename		 : WIN_TYPE.H
 *         Author		 : Paul Beardow
 *         Creation date : 28 Feb 95
 *         Last update   : 28 Sep 95 11:27:30
 *         Version number: 00.003
 *
 *	Function: Windows defines and modifications to standard
 *			  VIS & VRT defines
 *
 *	(c) Copyright Superscape VR plc 1995. All rights reserved.
 *
 *-------------------------------------------------------------------------
 *
 *	DECLARATIONS ----------------------------------------------------------
 */

#ifndef	WIN_TYPE_INCLUDED
#define	WIN_TYPE_INCLUDED

/*
 * PRB - Visual C++ Doesn't like huge in WIN32 function declarations
 */

#define	huge

/*
 * Structures common to Visualiser and device driver code
 */

#ifdef _WINDOWS
typedef struct tagT_HDCDATA
{
	HDC		hDC;
	HWND	hWnd;
	int		nWidth;
	int		nHeight;
	BOOL	fPrint;
} T_HDCDATA;
#endif

/*
 * DEBUG Macros	- print a string and extended error code
 */

#ifdef _DEBUG

#define	DebugPrintError(x);											\
		{															\
			char szDebug[128];										\
			DWORD dwErr;											\
																	\
			dwErr = GetLastError();									\
			if (dwErr != 0L)										\
				wsprintf(szDebug,"%s Fail Code %ld\n", x, dwErr);	\
			else													\
				wsprintf(szDebug,"%s\n", x);						\
			OutputDebugString(szDebug);								\
		}

#define	DebugPrintText(x);	OutputDebugString(x);

#define	DebugPrintValue(f,x);										\
		{															\
			char szDebug[128];										\
																	\
			wsprintf(szDebug,f, x);									\
			OutputDebugString(szDebug);								\
		}

#define	DebugMessageError(x);										\
		{															\
			char szDebug[128];										\
			DWORD dwErr;											\
																	\
			dwErr = GetLastError();									\
			if (dwErr != 0L)										\
				wsprintf(szDebug,"%s Fail Code %ld\n", x, dwErr);	\
			else													\
				wsprintf(szDebug,"%s\n", x);						\
			MessageBox(NULL,szDebug,"Debug",MB_OK);					\
		}

#else
#define	DebugPrintError(x);	  /* x */
#define	DebugPrintText(x);	  /* x */
#define	DebugPrintValue(f,x); /* x */
#define	DebugMessageError(x); /* x */
#endif

/*
 * get rid of a duplicate definition in winerror.h
 * and vrt
 */

#ifdef E_POINTER
#undef E_POINTER
#endif

/*	GLOBAL VARIABLES ------------------------------------------------------
 */

#ifdef _WINDOWS
extern 	BOOL		C_fWIN32s;
extern	HINSTANCE	C_hinstDLL;
#endif

/*	DEFINED FUNCTIONS -----------------------------------------------------
 */

#endif /* WIN_TYPE_INCLUDED */

/*-------------------------------------------------------------------------
 */
