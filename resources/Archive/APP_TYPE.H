/*
 *         Filename		 : APP_TYPE.H
 *         Author		 : Sean T Ellis
 *         Creation date : 15 Dec 94
 *         Last update   : 27 Aug 96 15:05:39
 *         Version number: 00.130
 *
 *	Function: Definition of various data types and defines which may be used
 *			  by the VRT and any SDK applications.
 *
 *	(c) Copyright Superscape VR plc 1995. All rights reserved.
 *
 *-------------------------------------------------------------------------
 *
 *	DECLARATIONS ----------------------------------------------------------
 */

#ifndef	APP_TYPE_INCLUDED
#include <stdio.h>

#ifdef WIN32
#ifndef W32SUT_16
#if !defined(_PPC_) && !defined(_ALPHA_) && !defined(_MIPS_) && !defined(_X86_) && defined(_M_IX86)
#define _X86_
#endif

#if !defined(_PPC_) && !defined(_ALPHA_) && !defined(_X86_) && !defined(_MIPS_) && defined(_M_MRX000)
#define _MIPS_
#endif

#if !defined(_PPC_) && !defined(_ALPHA_) && !defined(_X86_) && !defined(_MIPS_) && defined(_M_ALPHA)
#define _ALPHA_
#endif

#if !defined(_PPC_) && !defined(_ALPHA_) && !defined(_X86_) && !defined(_MIPS_) && defined(_M_PPC)
#define _PPC_
#endif

#if	( _MSC_VER >= 800 )
#pragma warning(disable:4001)
#endif
#include <excpt.h>
#include <stdarg.h>

#ifndef WINVER
#define WINVER 0x0400	// Assume NT 4.0
#endif
#include <WINDEF.H>
#endif	// W32SUT_16

#include "WIN_TYPE.H"
#endif	// WIN32

/*
 * 	WATCOM C defines ---------------------------------------------------------
 */

#ifdef __WATCOMC__

	/* __vrtcall is __cdecl calling convention								*/
	#define		__vrtcall	__cdecl

	/* __vrtexport symbols are defined in the link file so not needed here	*/
	#define		__vrtexport

	/* Far DOS vectors are supported so define the type						*/
	typedef void (__interrupt __far *T_DOSVECTOR)(void);

	/* SS_DBL is just plain double                                          */
	typedef	double			SS_DBL;
	#define	SS_DBL_RETVAL	double
	#define	MK_SS_DBL(d)	(d)
	#define	GET_SS_DBL(D)	(D)

#endif

/*
 * 	Visual C++ defines -------------------------------------------------------
 */

#ifdef _MSC_VER

	/* __vrtcall is standard calling convention so it is not needed			*/
	#define		__vrtcall

	/* __vrtexport symbols are defined using the declspec extension			*/
	#define		__vrtexport	__declspec(dllexport)

	/* Far DOS vectors are not supported so define dummy type				*/
	typedef void (*T_DOSVECTOR)(void);

	/* SS_DBL is double*                                                    */
	typedef	double			*SS_DBL;
	#define	SS_DBL_RETVAL	static double
	#define	MK_SS_DBL(d)	(&d)
	#define	GET_SS_DBL(D)	(*(D))

#endif

/*
 * 	Borland C++ defines ------------------------------------------------------
 */

#ifdef __BORLANDC__

	/* __vrtcall is standard calling convention so it is not needed			*/
	#define		__vrtcall

	/* __vrtexport symbols are defined in the .def file so not needed here	*/
	#define		__vrtexport

	/* Far DOS vectors are not supported so define dummy type				*/
	typedef void (*T_DOSVECTOR)(void);

	/* SS_DBL is double*                                                    */
	typedef	double			*SS_DBL;
	#define	SS_DBL_RETVAL	static double
	#define	MK_SS_DBL(d)	(&d)
	#define	GET_SS_DBL(D)	(*(D))

#endif

/* 	--------------------------------------------------------------------------
 */

/* Defines for where we are in the program (C_WhereAmI)
 */

#define	E_WMAINMENU		0x00
#define	E_WVISUALISER	0x10
#define	E_WWORLDED		0x20
#define	E_WSHAPEED		0x30
#define	E_WCONSOLEED	0x40
#define	E_WKEYED		0x50
#define	E_WSPRITEED		0x60
#define	E_WRESOURCEED	0x70
#define	E_WSOUNDED		0x80

/*	Error numbers for return from all routines --------------------------------
*/

#define	E_OK				0					/* General errors		*/
#define	E_ERROR				-1

#define	E_ERRFULL			-2					/* SCL: run time		*/
#define	E_ERRREADONLY		-3
#define	E_ERRTOOBIG			-4
#define	E_ERRDIVZERO		-5
#define	E_ERROVERFLOW		-6
#define	E_ERRINVPROC		-7
#define	E_ERRINVTYPE		-8
#define	E_ERRINVVAR			-9
#define	E_ERRINVCOUNTER		-10
#define	E_ERRINVMARKER		-11
#define	E_ERRINVADDRESS		-12
#define	E_ERRINVNAME		-13
#define	E_ERRILLEGAL		-14
#define	E_ERRTOODEEP		-15
#define	E_ERRNOFOR			-16
#define	E_ERRNORESUME		-17
#define	E_ERREMPTY			-18

#define	E_ERRUNKNOWN		-19       			/* SCL: compile time	*/
#define	E_ERRMESHING		-20
#define	E_ERRPROCNAME		-21
#define	E_ERRRESUMEPAR		-22
#define	E_ERRDEFVARPAR		-23
#define	E_ERRTABLEPAR		-24
#define E_ERRILLOBJ			-25
#define	E_ERRNOTLVAL		-26
#define	E_ERRNOSEMI			-27
#define	E_ERREXPRSYN		-28
#define	E_ERRNOBRAK			-29
#define	E_ERRWRONGTYPE		-30
#define	E_ERRNOCOMMA		-31
#define	E_ERRNOTVAR			-32
#define	E_ERREXPECTQ		-33
#define	E_ERREXPECTB		-34
#define	E_ERREXPECTC		-35
#define	E_ERREXPECTN		-36
#define	E_ERREXPECTO		-37
#define	E_ERREXPECTV		-38
#define	E_ERREXPECTP		-39
#define	E_ERRNOTINPROC		-40
#define	E_ERRCANTINDEX		-41
#define	E_ERREXPECTSC		-42
#define	E_ERRWRONGRET		-43
#define	E_ERRWRONGINP		-44
#define	E_ERREXPECTK		-45
#define	E_ERREXPECTCB		-46
#define	E_ERREXPECTCC		-47

#define	E_ERRELEMENTEMPTY	-48					/* Data Converter errors */
#define	E_ERRMAXLINES		-49
#define	E_ERRMAXFACETS		-50
#define E_ERRNOTPROC		-51

/* 	Number of application modules -----------------------------------------
 */

#define	E_MAXAPPS		100

/*  Generally useful stuff ------------------------------------------------
 */

typedef union
{
	long  			l;
	void 		   *p;
	short 			w[2];
	char  			b[4];
	unsigned short 	uw[2];
	unsigned char  	ub[4];
	float			f;
} T_LONGORPTR;

/*
 * 	Matrices and points ---------------------------------------------------
 */

typedef struct
{
	short	x,y;
} T_POINTREC2D;

typedef struct
{
	short	x,y,z,uz;
	short	ScaleFactor;
	short	Spare1,Spare2,Spare3;
} T_POINTREC3D;

typedef short T_MATRIX[3][3];

typedef struct
{
	short	x,y,z;
} T_VECTOR;

typedef struct
{
	long	x,y,z;
} T_LONGVECTOR;

typedef struct
{
	float	x,y,z;
} T_FVECTOR;

/*
 *	Defines for pick list -------------------------------------------------
 */

typedef struct
{
	char	   *Name;
	T_LONGORPTR	Value;
	char		Exclude;
} T_PICKITEM;

#define	E_PICKONE		0x01
#define	E_PICKSOME		0x00
#define	E_PICKNOSORT	0x02
#define	E_PICKSORT		0x00
#define	E_PICKFILTER	0x04

/*
 *  System information flags
 */
#define	E_SYS486				0x00000004
#define	E_SYSPENTIUM			0x00000005
#define	E_SYSPENTIUMPRO			0x00000006
#define E_SYSFAMILYMASK			0x0000000F
#define	E_SYSMMXPROCESSOR		0x00000010
#define	E_SYSKNIPROCESSOR		0x00000020

/*
 *	Device drivers --------------------------------------------------------
 */

#define	E_MAXPERDEV		16
#define	E_MAXDEVFUNCS	32

typedef void *(*T_FUNCPTR)(void *);
typedef void * __vrtcall (*T_STDFUNCPTR)(void *);

typedef struct
{
	T_STDFUNCPTR	**BaseAddress;
	unsigned char	*NumDevActive;
	unsigned char	*DevActive;
	void			*Config;
} T_DEVINSTALL;

/*
 * 	Defines and types for Timer device ------------------------------------
 */

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];
} T_TMINSTALLRET;

typedef struct
{
	long				Rate;
	volatile long		Counter;
	void       			*NextNode;
	void __vrtcall		(*Function)(void);
} T_TIMENODE;


/*
 * 	Defines and data types for keyboard ---------------------------------------
 */

#define	E_KBKEYPRESS	0x01
#define	E_KBKEYDEPRESS	0x02
#define	E_KBKEYRELEASE	0x04
#define	E_KBKEYREAD		0x08
#define	E_KBKEYSHIFT	0x10
#define	E_KBKEYCTRL		0x20
#define	E_KBKEYALT		0x40

#define	E_KBLSHIFT		0x01
#define	E_KBRSHIFT		0x02
#define	E_KBCTRL		0x04
#define E_KBALT			0x08
#define	E_KBAUX1		0x10
#define	E_KBAUX2		0x20
#define	E_KBAUX3		0x40
#define	E_KBAUX4		0x80

#define	E_KBCAPSLOCK	0x40
#define	E_KBNUMLOCK		0x20
#define	E_KBSCROLLLOCK	0x10
#define	E_KBPRINTSCREEN	0x01

#define E_FUNCBUFSIZE	1024
#define E_ASCTABLESIZE	512

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];

	volatile char	*KeyMap;
	volatile short	Head,Tail;
	char			*AscTable;
	volatile char	ShiftState,LockState;
} T_KBINSTALLRET;

typedef struct
{
	short	Delay,Repeat,BaseRate;
} T_KBSETUP;

typedef struct
{
	char	Ascii,KeyNum,ShiftState;
} T_KBKEYREC;

/*
 * 	Key scan codes for special keys
 */

#define	E_KSPRINT	0x37

#define	E_KSF1		0x3B
#define	E_KSF2		0x3C
#define	E_KSF3		0x3D
#define	E_KSF4		0x3E
#define	E_KSF5		0x3F
#define	E_KSF6		0x40
#define	E_KSF7		0x41
#define	E_KSF8		0x42
#define	E_KSF9		0x43
#define	E_KSF10		0x44
#define	E_KSF11		0x57
#define	E_KSF12		0x58

#define	E_KSPAD0	0x52
#define	E_KSPAD1	0x4F
#define	E_KSPAD2	0x50
#define	E_KSPAD3	0x51
#define	E_KSPAD4	0x4B
#define	E_KSPAD5	0x4C
#define	E_KSPAD6	0x4D
#define	E_KSPAD7	0x47
#define	E_KSPAD8	0x48
#define	E_KSPAD9	0x49
#define	E_KSPADMIN	0x4A
#define	E_KSPADPLUS	0x4E
#define	E_KSPADDOT	0x53

#define	E_KSUP		0x68
#define	E_KSDOWN	0x70
#define	E_KSLEFT	0x6B
#define	E_KSRIGHT	0x6D
#define	E_KSPGUP	0x69
#define	E_KSPGDOWN	0x71
#define	E_KSINSERT	0x72
#define	E_KSDELETE	0x73
#define	E_KSHOME	0x67
#define	E_KSEND		0x6F

/*
 * 	Defines and data types for 2D pointer device (Mouse) ----------------------
 */

#define E_MSCTLKEYB		0x0001
#define E_MSCTLCENTREH	0x0002
#define E_MSCTLCENTRES	0x0004
#define E_MSCTLACTIVEC	0x0008
#define E_MSCTLACTIVEK	0x0010
#define E_MSCTLVISIBLE	0x0020
#define E_MSCTLFLOATING	0x0040
#define E_MSCTLLMODE	0x0080
#define E_MSCTLLNORMAL	0x0100
#define E_MSCTLRMODE	0x0200
#define E_MSCTLRNORMAL	0x0400
#define E_MSCTLCENTREP	0x0800
#define E_MSCTLJUSTON	0x1000
#define E_MSCTLSUSPEND	0x2000
#define E_MSCTLOUTSIDE	0x4000	/* Outside of the window */
#define E_MSCTLMOVEBAR	0x8000	/* In use by move bar */

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];
} T_MSINSTALLRET;

typedef struct
{
	short	XMin,YMin,XMax,YMax;
	short	XStart,YStart;
} T_MSSETUP;

typedef struct
{
	volatile short			XPos,YPos,ButtonState;
	volatile unsigned char	PosFlag,ButtonFlag;
	T_TIMENODE			   *MouseTime;
} T_MSPOS;

typedef struct
{
	unsigned short	XPos,YPos,Width,Height;
	long			Function[4];
} T_ICON;

typedef struct
{
	unsigned short	NumIcons;
	T_ICON			Icons[1];
} T_ICONTABLE;

/*
 *	Defines and data types for graphics device driver -------------------------
 */

#define	E_GRMAXSCANHEIGHT 1024
#define	E_GRMAXSCANDEPTH  2
#define	E_GRMAXPOLYSIZE	  128

typedef struct
{
	short			Width,Height;
	char		   *SpriteData;
} T_GRSPRINST;

typedef struct
{
	short			Width,Height;
	long		    Offset;
} T_SPRITEINFO;

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];
} T_GRINSTALLRET;

typedef struct
{
	short			FirstCol,PalSize;
	unsigned char  *Palette;
	unsigned char  *Stipples;
	short			ModeFlags;
	long            Flags;
	unsigned char  *FontTable;
	void *		  (*ReAllocate)(long);
	long			DrawSize;
	char		   *Environment;
	char			VideoMode;
#ifdef WIN32
	void *			hViewWnd;
	char *			DrawBuffer;
	char *			SpriteBuffer;
	short			ScreenWidth;
	short			ScreenHeight;
#endif /* WIN32 */
} T_GRINSTALL;

#define E_GRIFNOSHUTUP	0x00000001
#define E_GRBACKGROUNDPALETTE 0x00000002

typedef struct
{
	short			NumSprites;
	T_GRSPRINST    *SpriteTable;
	short			Flags;
} T_GRSPRINSTALL;

typedef struct
{
	short			Sprite;
	short			Flags;
} T_GRSPRSINGLE;

#define		E_SPRUSER		1

typedef struct
{
	long			SaveSize;
	char 		   *SpriteData;
} T_GRSPRRETURN;

typedef struct
{
	short			Error;
	T_GRSPRRETURN  *SpriteTable;
} T_GRSPRITERET;

#define		E_SPRNOSAVE		0x08000
#define		E_SPRHOTSPOT	0x04000
#define		E_SPRPALETTE	0x08000
#define		E_SPRUSEPAL		0x04000
#define		E_SPRMASK		0x03FFF

#define		E_PALETTE		0x01
#define		E_TEXTURE		0x02
#define		E_INTERLACE		0x04
#define		E_EXTRACFG		0x08
#define		E_GRMOVE		0x10

typedef struct
{
	short			PointSize,Flags;
	unsigned char	Resolution;
	short			Hres,Vres;
	void 		   *DrawAddress;
	void		   *ExtraConfig;
} T_GROPTIONS;

/*
 * Flags for graphics options
 */

#define		E_PCPALETTE		0
#define		E_PCSTIPPLES	1
#define		E_PCRANGES		2

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	Palette[0x300];
} T_PALETTE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	Ranges[0x100];
} T_RANGES;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	Stipples[0x800];
} T_STIPPLES;


#define		E_NUMCOLS		256
#define		E_RGBSIZE		(E_NUMCOLS*3)
#define		E_STPSIZE		(E_NUMCOLS*8)
#define		E_RNGSIZE		E_NUMCOLS


typedef struct
{
	short			Width,Height;
	long			NumCols;
	long			Abilities;
	short			BitsPerPixel;
	short			NumResolutions;
	unsigned char	*ScreenBuffer;
	void			*DriverInfo;	
	short			NumConfigs,CurrentConfig;
	long			*ConfigFlags;
	char			**ConfigNames;
} T_GRSETUP;

/*
 * Flags for graphics abilities
 */

#define	E_ABILPOLY		0x00001
#define	E_ABILHOLES		0x00002
#define	E_ABILSORTED	0x00004
#define	E_ABILUNSORTED	0x00008
#define	E_ABILTRANSOBJ	0x00010
#define	E_ABILZBUF		0x00020
#define	E_ABILSCRSWAP	0x00040
#define	E_ABILPICK		0x00080
#define	E_ABILHORIZON	0x00100
#define E_ABILZAVAIL	0x00200
#define E_ABILFOGAVAIL	0x00400
#define E_ABILMOVEMESS	0x00800
#define E_ABILDITHER	0x01000
#define E_ABILTEXPERSP	0x02000
#define E_ABILTEXLINEAR	0x04000
#define E_ABILSMOOTH	0x08000
#define E_ABILFOG		0x10000

/*
 *  Flags for graphics configurations
 */
#define E_GRCOPYMASK		0x00000007
#define E_GRCOPYUNKNOWN		0x00000000
#define E_GRCOPYWING		0x00000001
#define E_GRCOPYDIRECTDRAW	0x00000002
#define E_GRDRAWMASK		0x00000038
#define E_GRDRAWUNKNOWN		0x00000000
#define E_GRDRAWSUPERSCAPE	0x00000008
#define E_GRDRAWDIRECT3D	0x00000010
#define E_GRDRAWOPENGL		0x00000018
#define E_GRPROCMASK		0x000001C0
#define E_GRPROCUNKNOWN		0x00000000
#define E_GRPROCSUPERSCAPE	0x00000040
#define E_GRPROCDIRECT3D	0x00000080
#define E_GRPROCOPENGL		0x000000C0
#define E_GRHARDWARE		0x00000200


typedef struct
{
	short			YStart,Height;
	unsigned char	Colour,Illumination;
	long			*ZBuffer;
	short			ScanBuf[E_GRMAXSCANHEIGHT][E_GRMAXSCANDEPTH*2+1];
} T_GRSCAN;

typedef struct
{
	short 			XStart,YStart;
	long  			ZStart;
	short 			XEnd,YEnd;
	long  			ZEnd;
	unsigned char	Colour,Illumination;
} T_GRLINE;

typedef struct
{
	short 			XPos,YPos,Align;
	short 			FontID,MaxLen;
	unsigned char	BGColour,FGColour;
	char			*String;
	unsigned char	Flags;
} T_GRTEXT;

typedef struct
{
	short			XPos,YPos,Width,Height;
} T_GRRECT;

typedef struct
{
	short			XPos,YPos,Width,Height,Hotx,Hoty,Flags;
	char		   *SaveBuffer;
	char 		   *SpriteData;
} T_GRSPRITE;

typedef struct
{
	short			FirstCol,PalSize;
	unsigned char  *Palette;
} T_GRPALETTE;

typedef struct
{
	short			FirstCol,StipSize;
	unsigned char  *Stipples;
} T_GRSTIPPLES;

typedef struct
{
	short			x,y;
	unsigned char	Illum,Pad;
	long			z;
} T_GRPOINTREC;

typedef struct
{
	unsigned short	FacNum;
	unsigned char	Flags,Colour;
	short			NumPoints;
	T_GRPOINTREC	Points[E_GRMAXPOLYSIZE];
} T_GRPOLYGON;

typedef struct
{
	unsigned char	*Data;
	long			Length;
	short			Flags;
	unsigned short  XPos,YPos,XSize,YSize,XStart,YStart;
} T_GRBACKDROP;

typedef struct
{
	char			*DrawList;
	short			x,y;
	unsigned short	Exclude;
} T_GRPICKOBJ;

/* T_GRPROCINFO defined later as is uses as yet undefined typedefs */

typedef struct
{
	unsigned char	Manufacturer,Version,Encoding,BitsPerPixel;
	unsigned short	XMin,YMin,XMax,YMax,HRes,VRes;
	unsigned char	ColourMap[48];
	unsigned char	Reserved,NPlanes;
	unsigned short	BytesPerLine,PaletteInfo,HScreenSize,VScreenSize;
	unsigned char	Filler[54];
} T_PCXHEADER;

#define E_MAXBACKDROPS 	32
#define E_WORLDBACKDROP	(E_MAXBACKDROPS-1)
#define E_SHAPEBACKDROP	(E_MAXBACKDROPS-2)
#define	E_BDFORE		0x01
#define	E_BDBACK		0x02
#define	E_BDNEW			0x04


/*
 * Structures for image library
 */

typedef struct
{
	unsigned char	*Data;
	unsigned char	*Palette;
	unsigned short	Width,Height,Pitch;
	unsigned char	BitsPerPixel;
	unsigned char	Id;
} T_IMAGEINFO;

#define	E_IMAGEBMP	0x00
#define	E_IMAGEGIF	0x01
#define	E_IMAGEJPG	0x02
#define	E_IMAGEPCX	0x03
#define	E_IMAGETGA	0x04
#define	E_IMAGETIF	0x05

/*
 * Structures for drawing list
 */

typedef struct
{
	char *			DrawList;
	char *			DrawStart;
	long			Length;
	short			NumFSF;
	long			Flags;
} T_DRAWLIST;

#define	E_DRAWBUFFER		0x0000
#define	E_PREDRAWBUFFER		0x0001
#define	E_POSTDRAWBUFFER	0x0002

/*
 * Structures for chunked drawing list
 */
typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	ObjNum;
	void			*ObjAdd;
	void			*Sibling,*PrevSib,*Child;
	unsigned short	Flags;
} T_DCOBJECT;

#define E_DCOBJZREQ			0x0004
#define E_DCOBJTRANSP		0x0008
#define E_DCOBJOUTLINESIL	0x0010
#define E_DCOBJNOSELECT		0x0020

typedef struct
{
	unsigned short	FacNum;
	unsigned char	FacAtt;
	unsigned char	Colour;
	unsigned short	NumPoints;
} T_DRAWFACET;

typedef struct
{
	unsigned short	TexWidth,TexHeight;
	char			*TexAd;
	unsigned short	ScaleX,ScaleY,OffsetX,OffsetY,TexScale;
	T_VECTOR		Points[4];
} T_DRAWTEXTURE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumFacets;
	T_DRAWFACET		Facet[1];
} T_DCFACET;

typedef struct
{
	unsigned short	ChkType,Length;
	T_GRTEXT		Text;
	char			String[1];
} T_DCTEXT;

typedef struct
{
	unsigned short	ChkType,Length;
	T_GRSPRITE		Sprite;
} T_DCSPRITE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	Attach[1];
} T_DCATTACH;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumFacets;
	T_DRAWFACET		PalFacet[1];
} T_DCPALFACET;

typedef struct
{
	short 			XStart,YStart;
	short 			XEnd,YEnd;
	unsigned char	Colour,Spare;
} T_DCRECTANGLE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumRects;
	T_DCRECTANGLE	Rect[1];
} T_DCRECT;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumRects;
	T_DCRECTANGLE	PalRect[1];
} T_DCPALRECT;

typedef union
{
	T_DCOBJECT		Obj;
	T_DCFACET		Fac;
	T_DCTEXT		Txt;
	T_DCSPRITE		Spr;
	T_DCATTACH		Att;
	T_DCPALFACET	PFc;
	T_DCRECT		Rec;
	T_DCPALRECT		PRc;

} T_DRAWCHUNK;

#define	E_DCOBJECT		0x0000
#define E_DCFACET		0x0001
#define	E_DCTEXT		0x0002
#define	E_DCSPRITE		0x0003
#define	E_DCATTACH		0x0004
#define	E_DCPALFACET	0x0005
#define	E_DCRECT		0x0006
#define	E_DCPALRECT		0x0007

/*
 * Flags for sprites
 */

#define	E_SPRFORE		0x01
#define	E_SPRBACK		0x02

/*
 *	Flags for facet attributes
 */

#define	E_FACMGROUP		0x01
#define	E_FACNODIR		0x02
#define	E_FACASSCOL		0x04
#define	E_FACHOLE		0x08
#define	E_FACSPECIAL	0x10
#define	E_FACINSIDE		0x20
#define	E_FACASSOC		0x40
#define	E_FACTEXTURE 	0x80


/*
 *	Colour defines
 */

#define	E_COLTRANSPARENT 0
#define	E_COLBLACK		 1
#define	E_COLBLUE		 2
#define	E_COLRED		 3
#define	E_COLGREEN		 4
#define	E_COLMAGENTA	 5
#define	E_COLYELLOW		 6
#define	E_COLGREY		 7
#define	E_COLDKGREY		 8
#define	E_COLLTBLUE		 9
#define	E_COLBRBLUE		10
#define	E_COLBRRED		11
#define	E_COLBRGREEN	12
#define	E_COLLTGREY		13
#define	E_COLBRYELLOW	14
#define	E_COLWHITE		15


/*
 * 	Defines and types for proportional device ---------------------------------
 */

#define E_MAXPROPAXES	32

typedef struct
{
	unsigned char	Shift[6];
	unsigned char	DeadZone[6];
	unsigned char	MaxAxes;
} T_PRAXES;

typedef struct
{
	char 			Spare1[16];
	char			CtrlName[16];
	char			Spare2[2];
	T_PRAXES		Sense[3];
	unsigned char	Spare3[7];
} T_PRINSTALL;

typedef struct
{
	short	Error,Id;
	char	Name[16];
	char	DialName[16];
} T_PRINSTALLRET;

typedef struct
{
	short	NumAxes;
	short	NumButtons;
} T_PRSETUP;

typedef struct
{
	long	Buttons;
	short	Axis[1];
} T_PRPOS;

/*
 * 	Defines and types for Sound device ------------------------------------
 */

typedef struct
{
	short	Error,Id;
	char	Name[16];
	char	DialName[16];
} T_SDINSTALLRET;

typedef struct
{
	unsigned short	Type;				/* Type as below				*/
	long			Length;				/* Total length					*/
	unsigned char	Pitch,Spare;		/* Recorded pitch MIDI#			*/
	long			Flags;				/* Various flags				*/
	unsigned char	Data[1];			/* Actual data					*/
} T_SOUNDREC;

/*
 * 	Sound types
 */

#define	E_STSAM8	0x0000				/* 8 bit PCM sample 			*/
#define	E_STSAM16	0x0001				/* 16 bit PCM sample 			*/
#define	E_STSAM4	0x0002				/* 4 bit ADPCM sample (!supported) */
#define	E_STFMVOICE	0x0003				/* FM Voice definition (!supported)*/

/*
 *	Sound flags
 */

#define	E_SFRIGHT	0x0001				/* Output on right channel		*/
#define	E_SFLEFT	0x0002				/* Output on left channel		*/

typedef struct
{
	unsigned short	Type;				/* Type of sound to record		*/
	long			Length;				/* Length (# of samples)		*/
	char 		   *Buffer;				/* Pointer to buffer			*/
} T_SOUNDRECORD;

typedef struct
{
	long			Handle;				/* Handle of sound to modify	*/
	unsigned short	Command;			/* Value type to modify 		*/
	long			Value;				/* Value to change it to		*/
} T_SOUNDMODIFY;

#define	E_SMODLENGTH	0     			/* Modify length of sound		*/
#define	E_SMODPITCH		1				/* Modify sound pitch			*/
#define	E_SMODPAN		2				/* Modify pan position of sound	*/
#define	E_SMODVOL		3				/* Modify volume of sound		*/
#define E_SMODLOOP		4				/* Modify looping state of sound */
#define E_SMODREF		5				/* Associate a byte with a handle */

#define	E_SMODQUERY		0x8000			/* Add to above to query value	*/

/*
 * 	Defines and types for Network device ----------------------------------
 */

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];
} T_NTINSTALLRET;

typedef struct
{
	short	UserNum,NumUsers;
	long	LongTimeOut;
	long	ShortTimeOut;
	long	*MonoTime;
	void	**WorldAddAdd;
	long	CheckRate;
	void	(*PrintTime)(short);
	void	(*PrintErr)(short,long);
} T_NTINSTALL;

typedef struct
{
	short 	Length;
	long	Seed;
} T_NTSETUP;

typedef struct
{
	short		User;
	short		Length;
	char		*Buffer;
} T_NTINPUT;

typedef struct
{
	short		NumUsers;
	T_NTINPUT	Buffers[1];
} T_NTOUTPUT;

/*
 * 	Defines and types for Serial device ----------------------------------
 */

typedef struct
{
	short			Error,Id;
	char			Name[16];
	char			DialName[16];
} T_SRINSTALLRET;

typedef struct
{
	short	PortNumber;		/* 0 for COM1, 1 for COM2 etc	*/
	short	BaudRate;		/* Required baud rate			*/
	char	Control;		/* Line Control Register		*/
} T_SRSETPORT;

/*	Values for line control register.						*/

#define E_SRLBITS5		0x00
#define	E_SRLBITS6		0x01
#define	E_SRLBITS7		0x02
#define	E_SRLBITS8		0x03

#define	E_SRLSTOP1		0x00
#define	E_SRLSTOP15		0x04

#define	E_SRLPARITYN	0x00
#define	E_SRLPARITYE	0x08
#define	E_SRLPARITYO	0x18
#define	E_SRLPARITYS	0x20

#define	E_SRLSBRK		0x40

typedef struct
{
	short	PortNumber;		/* 0 for COM1, 1 for COM2 etc	*/
} T_SRRELPORT;

typedef struct
{
	short	Error;			/* 0 = no error					*/
} T_SRRETURN;

typedef struct
{
	short	PortNumber;		/* 0 for COM1, 1 for COM2 etc	*/
	short	NumBytes;		/* Number of bytes to get/send	*/
	char	*Buffer;		/* Address of buffer			*/
} T_SRDATA;

typedef struct
{
	short	PortNumber;		/* 0 for COM1, 1 for COM2 etc	*/
	void	*Routine;		/* Address of routine			*/
} T_SRSETCALLBACK;

typedef struct
{
	unsigned char RChar;	/* Received character			*/
	unsigned char Status;	/* Status indicator				*/
} T_SRCALLBACK;

/*	Values for Status byte									*/

#define	E_SRSMODEM	0		/* Modem status error			*/
#define	E_SRSEMPTY	2		/* Transmit buffer empty		*/
#define	E_SRSRECVD	4		/* Character received			*/
#define	E_SRSLINE	6		/* Line status error			*/

typedef struct
{
	short	Error;			/* 0 = no error					*/
	short	PortAddress;	/* I/O address of port			*/
	char	IRQNumber;		/* IRQ number for port			*/
	char	IntNumber;		/* Interrupt number for port	*/
	char	IRQMask;		/* IRQ mask for port			*/
} T_SRPORTRET;

/*
 * 	File formats and defines ----------------------------------------------
 */

/*
 * 	Defines for "files changed" flags and file selector
 */

#define	E_MTYPECONFIG	0x00000001
#define	E_MTYPEWORLD	0x00000002
#define	E_MTYPESHAPE	0x00000004
#define	E_MTYPEPALETTE	0x00000008
#define	E_MTYPEFONT		0x00000010
#define	E_MTYPERESOURCE	0x00000020
#define	E_MTYPESPRITE	0x00000040
#define	E_MTYPEDEVICES	0x00000080
#define	E_MTYPEMESSAGE	0x00000100
#define	E_MTYPEBACKDROP	0x00000200
#define	E_MTYPEPREFS	0x00000400
#define	E_MTYPEUSERRSC	0x00000800
#define	E_MTYPEVRT		0x00001000
#define	E_MTYPEUSERSPR	0x00002000
#define	E_MTYPEAPPCODE	0x00004000
#define	E_MTYPESOUNDS	0x00008000
#define E_MTYPETHUMB	0x00010000


/*
 * 	Additional defines for use with new file selector
 */

#define E_MTYPEPCX		0x00010000
#define E_MTYPEGIF		0x00020000
#define E_MTYPETIF		0x00040000
#define E_MTYPETGA		0x00080000
#define E_MTYPEJPG		0x00100000
#define E_MTYPEBMP		0x00200000

#define E_MTYPEWAV		0x00400000
#define E_MTYPESMP		0x00800000

#define E_MTYPEDXF		0x01000000
#define E_MTYPEVCA		0x02000000
#define E_MTYPESCRIPT	0x04000000
#define E_MTYPEINF		0x08000000

#if defined(SW_EDITOR) || defined(FIFTY) || defined(VISNET)
#define E_MTYPESVR		0x10000000
#else // VISUALISER
#define E_MTYPESVR		0x00000000
#endif

#ifdef XVR_SUPPORT
#	define E_MTYPEXVR		0x20000000
#	define E_MTYPEVRTSVR	0x00000000
#	if defined(SW_EDITOR) || (defined(VISNET) && !defined(FULL_CONTROL))
#		define E_MTYPEVRTSVRXVR	0x40000000
#		define E_MTYPEVRTXVR	0x00000000
#	else // !(defined(SW_EDITOR) || (defined(VISNET) && !defined(FULL_CONTROL)))
#		define E_MTYPEVRTSVRXVR	0x00000000
#		define E_MTYPEVRTXVR	0x40000000
#	endif // !(defined(SW_EDITOR) || (defined(VISNET) && !defined(FULL_CONTROL)))
#else // !XVR_SUPPORT
#	define E_MTYPEXVR		0x00000000
#	define E_MTYPEVRTXVR	0x00000000
#	define E_MTYPEVRTSVR	0x40000000
#	define E_MTYPEVRTSVRXVR	0x00000000
#endif // !XVR_SUPPORT

#define E_MTYPEALL		0x80000000

/*
 * 	Composite flag types
 */

#define E_MTYPEANY		0xFFFFFFFF
#define	E_MTYPEANYGRAPH	0x803F0000
#define E_MTYPEANYSOUND	0x90C09000
#define E_MTYPEANYSS	0xF000FFFF

/*
 *	Standard file header
 */

typedef struct
{
	char			Text[200];
	long			Spare[10];
	long			Symbols;
	char			Type[4];
	unsigned short	Machine;
	long			Revision;
	unsigned char	Version,SubVersion;
} T_FILEHEADER;

/*
 * Defines and types for world data -------------------------------------------
 */
#define	E_MAXOBJECTS	 32700

typedef struct
{
	unsigned short	ChkType,Length,
					TotLen,Number;
	long			Child,Sibling;
	void *			Parent;
	void **			List;
	unsigned short	MaxChunk;
	long			XSize,YSize,ZSize,
					XPos,YPos,ZPos,
					DiagDis;
	unsigned short	Type,Layer;
	long			DFlags,OFlags;
	unsigned short	Trigger;
} T_STANDARD;

/* Values for T_STANDARD.DFlags	*/

#define	E_DFPRESORTED	0x80000000L
#define	E_DFENTERABLE	0x40000000L
#define	E_DFMOVABLE		0x20000000L
#define	E_DFREPLACEMENT	0x10000000L
#define	E_DFCOLOURDEFN	0x08000000L
#define	E_DFDONTREJECT	0x04000000L
#define	E_DFROTCOLL		0x01000000L
#define	E_DFROTSORT		0x00800000L
#define	E_DFDONTCHECK	0x00400000L
#define	E_DFNOADOPT		0x00200000L


/* Values for T_STANDARD.OFlags	*/

#define	E_OFINVISIBLE	0x80000000L
#define	E_OFINVISDEF	0x40000000L
#define	E_OFKILLED		0x20000000L
#define	E_OFSTOPMOV		0x10000000L
#define	E_OFAUTOANI		0x08000000L
#define	E_OFAUTODEF		0x04000000L
#define	E_OFRANGE		0x02000000L
#define	E_OFDECOUPLE	0x01000000L
#define	E_OFDECOUPDEF	0x00800000L
#define	E_OFSTOPCONDS	0x00400000L
#define	E_OFSTOPANGV	0x00200000L
#define	E_OFMSGWAITING	0x00080000L
#define	E_OFDEBUGSCL	0x00040000L
#define	E_OFDEBUGDEF	0x00020000L
#define	E_OFLOCALCONT	0x00010000L
#define	E_OFGLOBALCONT	0x00008000L
#define	E_OFTANGIBLE	0x00004000L
#define	E_OFTANGDEF		0x00002000L
#define	E_OFNOPUSH		0x00001000L
#define	E_OFNOPUSHDEF	0x00000800L

#define	E_OFDEFAULTS	0x44822800L

/* Defines for local triggers, T_STANDARD.Trigger	*/

#define	E_TRHIT			0x8000
#define	E_TRFALL		0x4000
#define	E_ACTIVATED		0x0001

/* Defines for global triggers */

#define	E_GTFIRSTFRAME	0x00000001
#define	E_GTTIMERA		0x00000002
#define	E_GTTIMERB		0x00000004
#define	E_GTTIMERC		0x00000008
#define	E_GTTIMERD		0x00000010

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	Colour[1];
} T_COLOURS;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	DefCol[1];
} T_DEFCOLS;

typedef struct
{
	unsigned short	ChkType,Length;
	short			XRot,YRot,ZRot,
					IXRot,IYRot,IZRot;
	unsigned short	Spare;
	long			XCentre,YCentre,ZCentre;
} T_ROTATIONS;

typedef struct
{
	unsigned short	ChkType,Length;
	long			VisDist,InvDist;
	unsigned short	Replace;
} T_DISTANCE;

typedef struct
{
	unsigned short	ChkType,Length;
	short			XAngV,YAngV,ZAngV,
					IXAngV,IYAngV,IZAngV;
} T_ANGVELS;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	SCL[1];
} T_SCL;

typedef struct
{
	unsigned char	FCel,LCel;
	short			CCel,Phase,AniVel,IAniVel;
	unsigned char	AniMode,IAniMode,Tick,ITick;
} T_ANISPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NAnims;
	T_ANISPEC		Anim[1];
} T_ANIMATIONS;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	Triggers;
	unsigned char	SCL[1];
} T_TRIGSCL;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	ColsCel,Cels;
	unsigned char	AnimCols[1];
} T_ANIMCOLS;

#define	E_AMSTOPPED	 	0
#define	E_AMWRAP	 	1
#define	E_AMBOUNCE	 	2
#define	E_AMWRAPF	 	3
#define	E_AMBOUNCEF	 	4
#define	E_AMWRAPC	 	5
#define	E_AMBOUNCEC	 	6
#define	E_AMBOUNCEC2 	7
#define E_AMPBOUNCE		8
#define E_AMPBOUNCEF	9
#define E_AMPBOUNCEC	10
#define E_AMPBOUNCEC2	11

typedef struct
{
	unsigned short	Facet,Object;
	unsigned char	Flag,Pad;
} T_ATTSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NAtts;
	T_ATTSPEC		Att[1];
} T_ATTACHMENTS;

typedef struct
{
	unsigned short	Origin,Vector;
} T_SHOOTSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NShoot;
	T_SHOOTSPEC		Shoot[1];
} T_SHOOTVEC;

typedef struct
{
	unsigned short	ChkType,Length;
	char			TextInfo[1];
} T_TEXTINFO;

typedef struct
{
	unsigned short	ChkType,Length;
	long			Bright,IBright;
	unsigned short	Flags;
	long			XVOff, YVOff, ZVOff,
					IXVOff,IYVOff,IZVOff;
	short			XRot,  YRot,  ZRot,
					IXRot, IYRot, IZRot;
	unsigned short	BeamWidth, IBeamWidth,
					Dispersion,IDispersion;
	unsigned char	ColR,ColG,ColB,IColR,IColG,IColB;
	unsigned short	BeamEdge,  IBeamEdge;
} T_LIGHTSOURCE;

typedef struct
{
	short			ObjNum;				/* Object attached to		*/
	long			PosX,PosY,PosZ;		/* Position					*/
	float			BeamX,BeamY,BeamZ;	/* Beam direction			*/
	float			BeamWidth;			/* Beam width factor		*/
	float			BeamEdge;			/* Beam edge sharpness		*/
	float			Brightness;			/* 100% brightness dist		*/
	float			Dispersion;			/* Power dispersion index	*/
	short			Flags;				/* Flags					*/
	unsigned char	r,g,b;				/* Colour of light source	*/
} T_LIGHT;

#define	E_MAXLIGHTS	128

#define	E_LSON		0x8000
#define	E_LSONDEF	0x4000
#define	E_LSPARA	0x2000
#define	E_LSOK		0x1000
#define	E_LSNONEG	0x0800
#define	E_LSROTPARA	0x0400
#define E_LSHEAD	0x0200

typedef struct
{
	short			XBend,YBend,ZBend,IXBend,IYBend,IZBend;
	unsigned short	FBend,LBend,CBend;
} T_BENDSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NBends;
	T_BENDSPEC		Bend[1];
} T_BENDING;

#define	E_VPRELROT	0x8000
#define	E_VPABSROT	0x8001
#define	E_VPPATH	0x8002

typedef struct
{
	unsigned short	KeyFrame;
	unsigned char	PFlag,PType;
	long			XVOff,YVOff,ZVOff;
} T_POSCONT;

typedef struct
{
	unsigned short	KeyFrame,ObjAtt,X,Y,Z;
	short			Zoom;
} T_ROTCONT;

typedef struct
{
	unsigned short	Length,ObjView,ObjCon,ObjMis,ObjFir,ShootVec,Point;
	unsigned short	CurFrame,TotFrame,NumPosCont,NumRotCont,OldZoom;
	unsigned char	VPLock,Type;
	T_POSCONT		PosCont[1];
} T_VIEW;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumVPs;
	T_VIEW			View[1];
} T_VIEWPOINT;

typedef struct
{
	unsigned short	ChkType,Length;
	short			SprXOff,SprYOff;
	unsigned short	Sprite;
	short			TxtXOff,TxtYOff;
	char *			Text;
	unsigned short	InitMessage;
	unsigned char	BGColour,FGColour;
} T_BUBBLE;

typedef struct
{
	long			XSize,YSize,ZSize;
	long			XOff,YOff,ZOff;
	long			IXSize,IYSize,IZSize;
	long			IXOff,IYOff,IZOff;
} T_COLLSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumColls;
	T_COLLSPEC		Collision[1];
} T_COLLISION;

typedef struct
{
	unsigned short	ChkType,Length;
	long			IXPos,IYPos,IZPos;
} T_INITPOS;

typedef struct
{
	unsigned short	ChkType,Length;
	long			IXSize,IYSize,IZSize;
} T_INITSIZE;

typedef struct
{
	unsigned short	ChkType,Length;
	long			MType,	    IMType;
	long			Fuel,	    IFuel;
	short			Collided,	CollCube;
	short			Flags;
	unsigned short	Coupled;
	short			Grav,	    IGrav;
	short			Climb,	    IClimb;
	T_LONGVECTOR	Drive,	    IDrive;
	T_LONGVECTOR	External,   IExternal;
	T_LONGVECTOR	MaxForce,   IMaxForce;
	T_VECTOR		GroundFric, IGroundFric;
	long			Mass,		IMass;
	T_VECTOR		DeltaR;
	char			Spare1[10];
	T_VECTOR		Restitution,IRestitution;
	T_LONGVECTOR	Vel,	    IVel;
	T_LONGVECTOR	MaxVel,	    IMaxVel;
	T_LONGVECTOR	CofG;
	T_MATRIX		MofI;
	T_LONGVECTOR	Stiction;
	short			ObjIn,ObjOn,GVel;
	short			Spare3,Spare4,Spare5;
} T_DYNAMICS;

#define	E_MVAIRBORNE	0x8000

#define	E_VTSIMPLE		0x80000000
#define E_VTNOCHECK		0x00000010
#define E_VTVIEWPOINT	0x00000020
#define	E_VTFLYING		0x00000040
#define E_VTPUSHABLE	0x00000080
#define	E_VTAIRDRIVE	0x00000100
#define	E_VTCANTPUSH	0x00000200
#define	E_VTNOROTATE	0x00000400

#define	E_VTUSEFORCES	0x00000800

#define	E_VTZEROEXT		0x00001000

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	LitCol[1];
} T_LITCOLS;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	DefLitCol[1];
} T_DEFLITCOLS;

#define	E_TEXOFF	4
#define	E_TEX4X4	3
#define	E_TEX3X3	2
#define	E_TEX2X2	1
#define	E_TEX1X1	0

typedef struct
{
	unsigned short	Facet;
	short			Texture, ScaleX, ScaleY, OffsetX, OffsetY, TexScale;
	short			ITexture,IScaleX,IScaleY,IOffsetX,IOffsetY,ITexScale;
} T_TEXSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NTextures;
	T_TEXSPEC		Tex[1];
} T_TEXTURES;

typedef struct
{
	float	tu,tv;
} T_TEXCOORD;

typedef struct
{
	unsigned short	Facet,NumPoints;
	short			Texture,ITexture,TexScale,ITexScale;
	short			ScaleX,ScaleY,OffsetX,OffsetY;
	T_TEXCOORD		Coord[1];
} T_TEXCOORDSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NTextures,Flags;
	T_TEXCOORDSPEC	Tex[1];
} T_TEXCOORDS;

#define	E_TCMAPSINGLE		0x0000	// mapping modes
#define	E_TCMAPPLANAR		0x0001
#define	E_TCMAPCYLINDRICAL	0x0002
#define	E_TCMAPSPHERICAL	0x0003
#define	E_TCMAPBOX			0x0004
#define	E_TCMAPMODEMASK		0x0007
#define E_TCLIGHT			0x0010	// light texture from underlying facet
#define	E_TCMAPX			0x0000	// mapping direction
#define	E_TCMAPY			0x0020
#define	E_TCMAPZ			0x0040
#define	E_TCMAPARBITARY		0x0060
#define	E_TCMAPDIRMASK		0x0060

typedef struct
{
	unsigned short	ChkType,Length;
	long			XPos,YPos,ZPos,
					XSize,YSize,ZSize;
} T_SORTING;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumTrans,Translate[1];
} T_TRANSLATE;

typedef struct
{
	unsigned short	ChkType,Length;
	long			EntityHandle;
	char			szName[64];
	long			nGestureID;
} T_ENTITY;

typedef struct
{
	long	Value;
	long	Min;
	long	Max;
} T_PROPERTY_LONG;

typedef struct
{
	long	Offset;
	long	Length;
	long	Strings;
} T_PROPERTY_STRING;

typedef struct
{
	float	Value;
	float	Min;
	float	Max;
} T_PROPERTY_FLOAT;

typedef struct
{
	short	Value;
} T_PROPERTY_BOOL;

#define E_PROPERTY_LONG		0
#define E_PROPERTY_STRING	1
#define E_PROPERTY_FLOAT	2
#define E_PROPERTY_BOOL		3

typedef struct
{
	unsigned short	Type;
	char			Name[32];
	union {
		T_PROPERTY_LONG		Long;
		T_PROPERTY_STRING	String;
		T_PROPERTY_FLOAT	Float;
		T_PROPERTY_BOOL		Bool;
	} Value;
} T_PROPERTYDEF;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumProperties;
	unsigned short	Changed;
	T_PROPERTYDEF	Property[1];
} T_PROPERTIES;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	ColsCel,Cels;
	unsigned char	AnimCols[1];
} T_ORIGINALCOL;

typedef struct
{
	unsigned short	Mode,Sound,Pitch,Chan;
	long			Vol,Handle;
} T_AUTOSOUNDDEF;

typedef struct
{
	unsigned short	ChkType,Length;
	short			NumSounds;
	T_AUTOSOUNDDEF	Sound[1];
} T_AUTOSOUND;

// values used in T_AUSOSOUNDDEF.Mode

#define E_ASNDTRIG		0x0001		// mouse click plays sound
#define E_ASNDTOGGLE	0x0002		// mouse click toggles sound on/off
#define E_ASNDINIT		0x0004		// play sound at startup
#define E_ASNDLOOP		0x0008		// loop the sound
#define E_ASNDCHILDTRIG	0x0010		// click any child to play sound

#define E_ASNDUPDATE	0x4000		// refresh sound using new parameters
#define E_ASNDPLAYNOW	0x8000		// trigger the sound next frame

// Materials chunk
#define E_MAXMATBANDS		8
#define E_MAXMATBANDSSHIFT	3

typedef struct
{
	unsigned char	Brightness,IBrightness;
	short			Image,IImage;
} T_MATSHADES;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned char	Shininess,IShininess;		// Power index (0=no specularity)
	unsigned char	Transparency,ITransparency;	// 0=opaque, 255=fully transparent
	long			Flags,IFlags;
	T_MATSHADES		Bands[E_MAXMATBANDS];		// Shading bands definition
	long			OLWidth3D,IOLWidth3D;		// 3D outline width
	long			OLExt3D,IOLExt3D;			// 3D outline extension
	unsigned char	OLWidth2D,IOLWidth2D;		// 2D outline width
	unsigned char	OLExt2D,IOLExt2D;			// 2D outline extension
	unsigned char	OLExtPercent,IOLExtPercent;	// Outline percentage extension
	short			OLImage,IOLImage;			// Outline texture
} T_MATERIAL;

#define E_MATCHILDREN		0x00000001   // Apply to all children unless they have their own material
#define E_MATBLEND			0x00000002   // Use additive blending with this material
#define E_MATTEXMODULATE	0x00000004   // Facet colour should modulate any texture
#define E_MATFADE			0x00000010   // Facets should fade according to orientation
#define E_MATFADEREVERSE	0x00000020   // Reverse fade direction if E_MATFADE set
#define E_MATNOPROJECT		0x00000040   // Never project onto this material
#define E_MATTRANSPMOD		0x00000080   // Material transparency should modulate stipple transparency
#define E_MATFLATLITCOL		0x00000100   // Facets are not lit but still use lit colours
#define E_MATIGNORELITCOL	0x00000200   // Facets are not lit and use current colours
#define E_MATTWOTONE		0x00000400   // Lit Facets are rendered as multi-tone
#define E_MATNOTEXLINEAR	0x00000800   // Textures are not linearly filtered
#define E_MATNOFOG			0x00001000   // Facets are not affected by fog
#define E_MATTWOTONE1D		0x00002000   // As multi-tone but bands defined by 1D texture
#define E_MATNOSELECT		0x00004000   // Disable selection of this material in the Visualiser
#define E_MATOUTLINEMAXMIN	0x00020000   // 3D outline has maximum 2D width, 2D outline becomes 3D at minimum 2D width
#define E_MATOUTLINE3D		0x00040000   // Outline width is in world units ie 3D
#define E_MATOUTLINEMAT		0x00080000   // Outlines are drawn between different base colours
#define E_MATOUTLINESIL		0x00100000   // Silhouette outline drawn around object and children
#define E_MATOUTLINEWIDTH	0x00E00000   // Outline width (0=thin, 7= thick)
#define E_MATOUTLINECOL		0xFF000000   // Palette index for outline colour (0=no outline)

// Projector chunk
typedef struct
{
	unsigned short	ChkType,Length;
	short			Image,IImage;			// Image to project
	long			Flags,IFlags;
	T_LONGVECTOR	BoundPos,IBoundPos;		// Position of bounding cuboid relative to parent
	T_LONGVECTOR	BoundSize,IBoundSize;	// Size of bounding cuboid
	unsigned char	RGBA[4],IRGBA[4];		// Modulating colour
} T_PROJECTOR;

#define E_PROJLINEAR    0x0001   // Linear projection, perspective otherwise
#define E_PROJSINGLE    0x0002   // Don't repeat linear projection
#define E_PROJREFLECT   0x0004   // Reflector rather than projector
#define E_PROJBOTHSIDES 0x0008   // Project onto back facing facets (wrt projector)
#define E_PROJCHILDREN  0x0010   // Only parent and its children to be projected onto
#define E_PROJNOBLEND   0x0020   // Don't blend the texture
#define E_PROJDISABLE   0x0040   // Projector is disabled
#define E_PROJMIRROR    0x0080   // Mirror projector
#define E_PROJSHADOW    0x0100   // Shadow projector
#define E_PROJNOBOUNDS  0x0200   // No bound values required
#define E_PROJNOUPDATE  0x0400   // Don't update mirror/shadow

#define E_PROJESCALEMASK  0xF000   // Environment map tweak value mask
#define E_PROJESCALESHIFT 12	   // Environment map tweak value shift
#define E_PROJESCALESCALE 4		   // Environment map tweak value scale

// Horizon chunk
typedef struct
{
	unsigned short	ChkType,Length;
	long			Flags,IFlags;
	short			FullTex[6],IFullTex[6];	// Images for fully textured horizon
	short			HalfTex[5],IHalfTex[5];	// Images for half textured horizon
	short			StripTex,IStripTex;		// Image for horizon stripe
	unsigned char	RGBA[4],IRGBA[4];		// Modulating colour
} T_HORIZON;

#define E_HRZFOGHORZ	0x01				// Allow horizon to be affected by fog
#define E_HRZSTRIPREP	0xFF00				// Mask for horizon strip repeat value

#define E_HZNONE		1
#define E_HZHORIZON		0
#define E_HZSOLID		2
#define E_HZBACKDROP	4
#define E_HZTEXFULL		6
#define E_HZTEXHALF		8
#define E_HZTEXSTRIP	10

// Fog Volume chunk
typedef struct
{
	unsigned short	ChkType,Length;
	long			Flags,IFlags;
	unsigned short	Object,IObject;			// Object defining volume
	long			Density,IDensity;		// Distance at which 100% fog
	unsigned char	RGBA[4],IRGBA[4];		// Fog colour
} T_FOGVOLUME;

#define E_FOGINFINITE  0x0001	// Fog volume ahs infinite top plane
#define E_FOGVOID      0x0002	// Fog volume has no effect
#define E_FOGDISABLE   0x0004   // Fog volume is disabled

typedef union
{
	T_STANDARD		Std;
	T_ANGVELS		Ang;
	T_ANIMATIONS	Ani;
	T_ANIMCOLS		Acl;
	T_ATTACHMENTS	Att;
	T_AUTOSOUND		Asn;
	T_BENDING		Ben;
	T_BUBBLE		Bub;
	T_COLLISION		Cln;
	T_COLOURS		Col;
	T_DEFCOLS		Def;
	T_DEFLITCOLS	Dlc;
	T_DISTANCE		Dis;
	T_DYNAMICS		Dyn;
	T_ENTITY		Ent;
	T_INITPOS		Ips;
	T_INITSIZE		Isz;
	T_LIGHTSOURCE	Lig;
	T_LITCOLS		Lit;
	T_ORIGINALCOL	Ocl;
	T_PROPERTIES	Prp;
	T_ROTATIONS		Rot;
	T_SCL			SCL;
	T_SHOOTVEC		Sho;
	T_SORTING		Sor;
	T_TEXTINFO		Tex;
	T_TEXCOORDS		Txc;
	T_TEXTURES		Txr;
	T_TRANSLATE		Snx;
	T_TRANSLATE		Spx;
	T_TRIGSCL		Glo;
	T_TRIGSCL		Loc;
	T_VIEWPOINT		Vpt;
	T_MATERIAL		Mat;
	T_PROJECTOR		Prj;
	T_HORIZON		Hrz;
	T_FOGVOLUME		Fog;

	/* Included for compatibility with earlier versions */
	/* ------------------DO NOT USE-------------------- */

	T_STANDARD		Inv;

} T_WORLDCHUNK;

#define	E_CTSTANDARD	0x0000
#define E_CTCOLOURS		0x0001
#define	E_CTDEFCOLS		0x0002
#define	E_CTROTATIONS	0x0003
#define	E_CTDISTANCE	0x0004
#define	E_CTANGVELS		0x0005
#define	E_CTSCL			0x0006
#define	E_CTANIMATIONS	0x0007
#define	E_CTSCLLOCAL	0x0008
#define	E_CTSCLGLOBAL	0x0009
#define	E_CTANIMCOLS	0x000A
#define	E_CTATTACHMENTS	0x000B
#define	E_CTSHOOTVEC	0x000C
#define	E_CTTEXTINFO	0x000D
#define	E_CTLIGHTSOURCE	0x000E
#define	E_CTINITSIZE	0x000F
#define	E_CTBENDING		0x0010
#define	E_CTVIEWPOINT	0x0011
#define	E_CTBUBBLE		0x0012
#define	E_CTCOLLISION	0x0014
#define	E_CTINITPOS		0x0015
#define	E_CTDYNAMICS	0x0016
#define	E_CTLITCOLS		0x0017
#define	E_CTDEFLITCOLS	0x0018
#define	E_CTTEXTURES	0x001A
#define	E_CTSORTING		0x001B
#define	E_CTSPRTRANS	0x001C
#define	E_CTSNDTRANS	0x001D
#define	E_CTENTITY		0x001E
#define E_CTPROPERTIES	0x001F
#define E_CTTEXCOORDS	0x0020
#define E_CTORIGINALCOL 0x0021
#define E_CTAUTOSOUND	0x0022
#define E_CTMATERIAL	0x0023
#define E_CTPROJECTOR	0x0024
#define E_CTHORIZON		0x0025
#define E_CTFOGVOLUME	0x0026

// USED IN ASSERTS - PLEASE UPDATE WHEN ADDING NEW CHUNK TYPES
#define E_CT_MAXCHUNK	0x0026

/*
 *	Defines and types for shape data ------------------------------------------
 */

typedef struct
{
	short	x,y,z;
} T_ABSPOINT;

typedef struct
{
	short			Point1,Point2;
	unsigned char	Shift,Mult;
} T_GEOMPOINT;

typedef struct
{
	unsigned short	x,y,z;
} T_UABPOINT;

typedef union
{
	 T_ABSPOINT		Abs;
	 T_ABSPOINT		Rel;
	 T_GEOMPOINT	Geom;
	 T_UABPOINT		Uab;
} T_GENPOINT;

#define	E_PNTDYNAMIC	0x8000
#define	E_PNTORIGIN		0x4000
#define	E_PNTANIMMASK	0x0038
#define	E_PNTANIMSHFT	3
#define	E_PNTTYPEMASK	0x0007

#define	E_PNTABSTYPE	0
#define	E_PNTRELTYPE	1
#define	E_PNTGEOMTYPE	2
#define	E_PNTUABTYPE	3

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumPoints,NumCels;
} T_POINTSCHK;

typedef struct
{
	unsigned short	Start,End;
} T_LINE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumLines;
	T_LINE			Line[1];
} T_LINECHK;

typedef struct
{
	unsigned char	NumLines,FacAtt;
	unsigned short	Number,Line[1];
} T_FACET;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumFacets;
	T_FACET			Facet[1];
} T_FACETCHK;

typedef struct
{
	unsigned short	ChkType,Length;
	long			XSize,YSize,ZSize;
} T_SHAPESIZE;

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	NumNormals,NumCels;
	unsigned short	ShapeNum,Checksum;
	T_VECTOR		Normals[1];
} T_NORMALS;

#define E_MAXNORMSPERCHUNK	10920

typedef union
{
	T_ANIMCOLS		Acl;
	T_COLOURS		Col;
	T_FACETCHK		Fac;
	T_LINECHK		Lin;
	T_LITCOLS		Lit;
	T_POINTSCHK		Pnt;
	T_SCL			SCL;
	T_SHAPESIZE		Siz;
	T_TEXTINFO		Tex;
	T_TEXTURES		Txr;
	T_TRANSLATE		Spx;
	T_NORMALS		Nor;
} T_SHAPECHUNK;

#define	E_SCPOINTS		0x0000
#define	E_SCLINES		0x0001
#define	E_SCFACETS		0x0002
#define	E_SCCOLOURS		0x0003
#define	E_SCLITCOLS		0x0004
#define	E_SCTEXT		0x0005
#define	E_SCSIZE		0x0006
#define	E_SCSCL			0x0007
#define	E_SCANIMCOLS	0x0008
#define	E_SCTEXTURES	0x0009
#define	E_SCSPRTRANS	0x000A
#define	E_SCNORMALS		0x000B

/*
 *  Remaining graphics device structure
 */

typedef struct
{
	T_WORLDCHUNK	*Tree;
	short			ObjView;
	T_LINE			**LineAd;
	T_FACET			**FacetAd;
	void			**DrawAd;
	short			Plane,ZPlane,ZPlaneScale;
	T_NORMALS		**NormAd;
	long			XDispOpts;
	unsigned char	*PointsDisplay;
	short			*PointsSelected;
} T_GRPROCINFO;

/*
 *	Structure for object and facet number at given position -------------------
 */

typedef struct
{
	short	Object,Facet;
} T_OBJFAC;

/*
 * 	Viewpoint control entry --------------------------------------------------
 */

typedef struct
{
	unsigned short	ObjNum,VPNum;
} T_VPENTRY;

/*	Defines for markers and counters ------------------------------------------
*/

#define	E_MAXMARKERS	256
#define	E_MAXCOUNTERS	64

/*
 *	Defines and types for chunked symbol info----------------------------------
 */

typedef struct
{
	unsigned short	ChkType,Length;
	short			Number;
	char			Name[32];
} T_SYMNAME;

typedef struct
{
	unsigned char	Number;
	char			Name[9];
} T_SYMVARSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	short			NumVars;
	T_SYMVARSPEC	Var[1];
} T_SYMVARNAMES;

typedef struct
{
	short			Offset;
	char			Text[1];
} T_SYMCOMMENT;

typedef struct
{
	unsigned short	ChkType,Length;
	T_SYMCOMMENT	Comment[1];
} T_SYMCOMMENTS;

typedef struct
{
	unsigned short	Number;
	char			Name[34];
} T_SYMLYRSPEC;

typedef struct
{
	unsigned short	ChkType,Length;
	short			NumLayers;
	T_SYMLYRSPEC	Layer[1];
} T_SYMLAYERNAMES;

typedef struct
{
	unsigned short	ChkType,Length;
	long			XSize,YSize,ZSize;
} T_SYMSHAPESIZE;

#define	E_SYMOBJNAME	0x0000
#define	E_SYMSHPNAME	0x0001
#define	E_SYMVARNAMES	0x0002
#define	E_SYMCOMMENTS	0x0003
#define	E_SYMLAYERNAMES	0x0004
#define	E_SYMSHAPESIZE	0x0005
#define	E_SYMSNDNAME	0x0006
#define	E_SYMSPRNAME	0x0007
#define	E_SYMLOCVARS	0x0008
#define	E_SYMLOCCOMM	0x0009
#define	E_SYMGLOVARS	0x000A
#define	E_SYMGLOCOMM	0x000B

typedef union
{
	T_SYMCOMMENTS	Comments;
	T_SYMCOMMENTS	GloComm;
	T_SYMCOMMENTS	LocComm;
	T_SYMLAYERNAMES	LayerNames;
	T_SYMNAME		ObjName;
	T_SYMNAME		ShpName;
	T_SYMNAME		SndName;
	T_SYMNAME		SprName;
	T_SYMSHAPESIZE	ShpSize;
	T_SYMVARNAMES	GloVars;
	T_SYMVARNAMES	LocVars;
	T_SYMVARNAMES	VarNames;
} T_OBJSYM;

/*
 *	Chunk types for configuration file ----------------------------------------
 */

#define	E_CCGENERAL			0x00
#define	E_CCPALETTE			0x01
#define	E_CCCONSOLE			0x02
#define	E_CCICONTABLE		0x03
#define	E_CCFUNCTION		0x04
#define	E_CCBACKDROP		0x05
#define	E_CCDEVICE			0x06
#define	E_CCSHAPE			0x07
#define	E_CCWORLD			0x08
#define	E_CCUSER			0x09
#define E_CCJOYTABLE		0x0A
#define E_CCMESSAGE			0x0B
#define E_CCVIEWPOINT		0x0C
#define E_CCRESOURCE		0x0D
#define E_CCFONTFILE		0x0E
#define	E_CCPROPTABLE		0x0F
#define	E_CCINSVALS			0x10
#define	E_CCSPRITES			0x11
#define	E_CCADDFUNCTION		0x12
#define	E_CCADDJOYTABLE 	0x13
#define	E_CCUSERRESOURCE	0x14
#define	E_CCADDPROPTABLE	0x15
#define	E_CCUSERSPRITES		0x16
#define	E_CCAPPNAME			0x17
#define	E_CCEDITCONFIG		0x18
#define	E_CCDEVICEPARAMS	0x19
#define	E_CCNETPARAMS		0x1A
#define	E_CCSNDNAME			0x1B
#define	E_CCSOUNDPARAMS		0x1C
#define E_CCSYSMESSAGE		0x1D
#define E_CCPROPPARAMS		0x1E
#define E_CCKEYTABLE		0x1F
#define	E_CCADDDEVICES		0x20
#define	E_CCMULTIDEVS		0x21
#define	E_CCAPPNAMEDOS		0x22
#define	E_CCAPPNAMEWIN		0x23
#define E_CCEXTRACONFIG		0x24

/*
 * Chunk definitions for configuration file -----------------------------------
 */

/* Display mode flags */

#define	E_MMTIMINGS		0x00000001
#define	E_MMPAUSERR		0x00000002
#define	E_MMDRAWTIME	0x00000004
#define	E_MMFLYBACK		0x00000008
#define	E_MMCROSSHAIR	0x00000010
#define	E_MMUSECROSS	0x00000020
#define	E_MMABSTIME		0x00000040
#define	E_MMPROPMENU	0x00000080
#define	E_MMSHADEONCE	0x00000100
#define	E_MMSHADEVERY	0x00000200
#define	E_MMZOOMHOR		0x00000400
#define	E_MMOUTERCUBE	0x00000800
#define	E_MMSORTCUBE	0x00001000
#define	E_MMCOLLCUBE	0x00002000
#define	E_MMGROUP		0x00004000
#define	E_MMNOMENU		0x00008000
#define	E_MMLIMITFPS	0x00010000
#define	E_MMMOUSEMOVE	0x00020000
#define	E_MMTRANSPFAC	0x00040000
#define	E_MMNOVISMENU	0x00080000
#define	E_MMNOSAVESCR	0x00100000
#define	E_MMNOKEYTITLE	0x00200000
#define E_MMNOSHUTUP	0x00400000
#define	E_MMSHOWSEL		0x00800000
#define	E_MMSHOWINV		0x01000000
#define	E_MMWORLDAXES	0x02000000
#define	E_MMTEXTYPE		0x04000000
#define	E_MMINTERLACE	0x08000000
#define	E_MMMENUTRANS	0x10000000

/* eXtra Display OPtion flag equates */

#define	E_XDOPPOINTS	0x00000001
#define	E_XDOPCONST		0x00000002
#define	E_XDOPPNTNUM	0x00000004
#define	E_XDOPCUBE		0x00000008
#define	E_XDOPSHOWBP	0x00000010
#define	E_XDOPALLCON	0x00000020
#define	E_XDOPFACNUM	0x00000040
#define	E_XDOPNODEPTH	0x00000080
#define	E_XDOPMARKER	0x0000FF00
#define	E_XDOPNOIMPORT	0x00010000
#define	E_XDOPNEWFACET	0x000E0000
#define E_XDOPSHADESHAPE 0x00100000

typedef struct
{
	unsigned short	TimerA,TimerB,TimerC,TimerD;
	unsigned char	Ambient;
	unsigned short	KDel,KRep;
	short			Detail;
	unsigned char	Resolution;
	unsigned char	BufClr;
	long			DrawSize;
	unsigned char	BufClrCol;
	char			TextureScale;
	long			Flags;
	unsigned short	StepSize;
	short			AngleSize;
	short			Spare2;
	long			UndoSize;
	short			BackDrop;
	short			StepSize2;
	unsigned short	AbsTime;
	unsigned short	FPSLimit;
	unsigned short	PointSize;
	unsigned short	TimeScale;
	unsigned char	Spare[6];
} T_GENERAL;

#define	E_CONSFULLSCR	0x0001
#define	E_CONSAUTOSCALE	0x0002
#define	E_CONSDISABLED	0x0004
#define	E_CONSDEFDISABL	0x0008
#define	E_CONSOUTLINE	0x0010
#define	E_CONSMASTER	0x0020
#define	E_CONSTEXTURE	0x0040
#define	E_CONSRELLEFT	0x0080
#define	E_CONSRELRIGHT  0x0100
#define	E_CONSRELTOP 	0x0200
#define	E_CONSRELBOTTOM 0x0400
#define	E_CONSREL	 	0x0780

#define	E_MAXCONS		51

typedef struct
{
	unsigned short	WindWidth,WindHeight,WindXMid,WindYMid;
	unsigned short	WindXMin,WindXMax,WindYMin,WindYMax;
	T_POINTREC2D	Corners[8];

	short			XScale,YScale,ZScale;

	long			Vx,Vy,Vz,VxOff,VyOff,VzOff;
	short			Vrx,Vry,Vrz,VrxOff,VryOff,VrzOff;
	unsigned char	VPLock;

	short			Flags;

	short			BackDrop,IconTable,FuncTable,StartVP,GRDevNumber,
					CurrentVP,NextConsole;

	unsigned short	NumInstr;
	unsigned short	IWindWidth,IWindHeight,IWindXMid,IWindYMid;
	short			RTBackDrop;
} T_CONSOLE;

typedef struct
{
	unsigned short	XPos,YPos,Width,Height,Type,Index;
	T_LONGORPTR		PrevInsVal,PrevInsVal2;
} T_INSTRUMENT;

typedef struct
{
	char			DialName[16];
	char			ControlName[16];
	short			Spare;
	char			Config[46],HWConfig[44];
	long			*MonoTime;
	long			ButtFunc[32];
	long			AxisFunc[5];
} T_PROPTABLE;

typedef struct
{
	short			InsNumber;
	T_LONGORPTR		InsVal,InsVal2;
} T_INITINSVAL;

typedef struct
{
	long			Function;
	short			PropVal;
} T_FUNCTION;

typedef struct
{
	short			KeyNum;
	long			Function;
} T_KEYENTRY;

typedef struct
{
	short			NumKeys;
	T_KEYENTRY		KeyDef[1];
} T_KEYTABLE;

#define	E_REPEATFUNC	0x0001		/* Function is repeatable			*/
#define	E_FNCV			0x0002		/* Function valid in Visualiser		*/
#define	E_FNCW			0x0004		/* Function valid in World Ed		*/
#define	E_FNCS			0x0008		/* Function valid in Shape Ed		*/
#define	E_FNCL			0x0010		/* Function valid in Layout Ed		*/
#define	E_FNCI			0x0020		/* Function valid in Image Ed		*/
#define	E_FNCN			0x0040		/* Function valid in Sound Ed		*/
#define	E_FNCR			0x0080		/* Function valid in Resource Ed	*/
#define	E_FNCK			0x0100		/* Function valid in Key Ed			*/
#define	E_FNCALL		0x01FE		/* Function valid everywhere		*/
#define	E_FNCH			0x0200		/* Function valid in history list	*/

typedef struct
{
	long			Function;
	short			Name;
	short			Flags;
} T_FUNCNAME;

typedef struct
{
	unsigned char	RelPtCol,			/* Shape editor stuff 	*/
					GeomPtCol,
					BoundPtCol,
					BoundCol,
					XAxisCol,
					YAxisCol,
					ZAxisCol,
					BackgndCol,
					CollCubeCol,
					SortCubeCol;
	short			GeomShift,
					MovStep;
	long			ShpOpts;

	char			UpdateFlags,		/* World editor stuff	*/
					DecompileNum;

	unsigned char	NextCol;			/* Next facet colour in shped */
	unsigned char	SelPntCol,			/* Shape editor stuff 	*/
					SelFacCol,
					FacNumCol,
					PntNumCol,
					OXYZCol,
					ConstCol;

	unsigned char	SelectCol,			/* World editor stuff */
					InvisCol;

	unsigned char	ImageBGCol,			/* Image editor background colour */
					LayoutBGCol,		/* Layout editor ...	*/
					SoundBGCol,			/* Sound editor ...		*/
					ResourceBGCol,		/* Resource editor ...	*/
					KeyboardBGCol,		/* Keyboard editor ...	*/

					BorderDisabled,		/* Default colours for resources */
					BorderNormO1,
					BorderNormO2,
					BorderNormI1,
					BorderNormI2,
					BorderButtonO1,
					BorderButtonO2,
					BorderButtonO3,
					BorderButtonI1,
					BorderButtonI2,
					BorderButtonI3,
					BorderEditI1,
					BorderEditI2,
					BorderEditI3,
					BorderEditI4,
					BorderEditO1,
					BorderEditO2,
					BorderEditO3,
					BorderEditO4,
					BorderPlainI1,
					BorderPlainI2,
					BorderPlainI3,
					BorderPlainI4,
					ItemBG,
					ItemFG,
					TitleBG,
					TitleFG,
					EditBG,
					EditFG,
					ButtonBG,
					ButtonFG,
					DisabledFG,
					GroupBG,
					GroupBorder,
					PaneBG,
					SliderHandle,
					SliderBG,
					SliderFG,
					CursorFG,
					InvisBG,
					InvisFG;

	short			DblClkTimeLimit;
	short			DblClkPixMoveLimit;
	short			SngClkTimeLimit;
	short			SngClkPixMoveLimit;
	short			MouseAutoRepeatDelay;
	short			MouseAutoRepeatPeriod;
	short			ScrollRepeatPeriod;

	short			EditorView;			/* Perspective, plan, etc. */

	char			Spare[29];			/* Lots of spare space	*/
} T_EDITCONFIG;

/*
 *  T_EDITCONFIG.EditorView values
 */
#define		E_VMPLAN			0
#define		E_VMNORTH			1
#define		E_VMSOUTH			2
#define		E_VMEAST			3
#define		E_VMWEST			4
#define		E_VMPERSP			5
#define		E_VMUNDERSIDE		6

typedef struct
{
	short			StartPropDevice;
	short			PropAddress[E_MAXPERDEV];
} T_DEVICEPARAMS;

typedef struct
{
	short			StartSoundDevice;
	short			Spare[9];
} T_SOUNDPARAMS;

typedef struct
{
	short			NumUsers,UserNum;
	long			LongTimeOut,ShortTimeOut,CheckRate;
} T_NETPARAMS;

typedef struct
{
	short			Id,NumBytes;
	char 			Data[1];
} T_PROPDATA;

typedef struct
{
	short			StartPropId;
	T_PROPDATA		PData[1];
} T_PROPPARAMS;

typedef struct
{
	short			PropId;
	char			Enabled;
	short			NumBytes;
	char			Data[1];
} T_PROPSETUP;

typedef struct
{
	unsigned short	DevId,Length,NumSetups;
	T_PROPSETUP		Setup[1];
} T_PROPMULTI;

typedef struct
{
	short			ObjNum;
	T_LIGHTSOURCE	*Light;
} T_LIGHTDEF;

typedef struct
{
	long			Flags;
	float			CosSmoothAngle,PlaneError,InsideError;
	long			ZBias,NearClip,FarClip;
	long			NumLights;
	T_LIGHTDEF		*LightList;
	long			FogStart,IFogStart;
	long			FogEnd,IFogEnd;
	long			FogDensity,IFogDensity;
	unsigned char	FogR,FogG,FogB,FogA;
	unsigned char	IFogR,IFogG,IFogB,IFogA;
	unsigned char	AmbientR,AmbientG,AmbientB,AmbientA;
	unsigned char	IAmbientR,IAmbientG,IAmbientB,IAmbientA;
	short			SelectedObj;
	char			Spare[20];
} T_EXTRACONFIG;

#define E_EXCFGZBUFAUTO		0x00000000
#define E_EXCFGZBUFFULL		0x00000001
#define E_EXCFGZBUFNOSORT	0x00000002
#define E_EXCFGZBUFOFF		0x00000003
#define E_EXCFGZBUFMASK		0x00000003

#define E_EXCFGLITCOLGUESS	0x00000004
#define E_EXCFGLITCOLSONLY	0x00000008

#define E_EXCFGFOGOFF		0x00000000
#define E_EXCFGFOGLINEAR	0x00000010
#define E_EXCFGFOGEXP		0x00000020
#define E_EXCFGFOGEXP2		0x00000030
#define E_EXCFGFOGMASK		0x00000030

#define E_EXCFGSELECTOBJ	0x00000080
#define E_EXCFGOBJNORMALS	0x00000100

#define E_EXCFGNODITHER		0x00000200
#define E_EXCFGNOTEXPERSP	0x00000400
#define E_EXCFGTEXLINEAR	0x00000800
#define E_EXCFGANTIALIAS	0x00001000
#define E_EXCFGDONTUSEMMX	0x00002000
#define E_EXCFGDONTUSEKNI	0x00004000
#define E_EXCFGNOSPECULAR	0x00008000

/*
 *	Defines and types for message data -------------------------------------
 */

typedef struct
{
	unsigned short	MsgNum,Length;
	char			Text[1];
} T_MESSAGE;

/*
 *	Defines and types for font data ----------------------------------------
 */

typedef struct
{
	unsigned short	FontID,
					Length,
					Width,
					Height;
	unsigned char	FontData[1];
} T_FONTINFO;

/*
 *	Defines and types for menu/dialogue structures -----------------------------
 */

/*
 * 	Generalised value. Can store an immediate value, or a value in a buffer.
 */

typedef struct
{
	unsigned short	Flags;
	T_LONGORPTR		Value;
}	T_DIALVALUE;

/*
 * 	T_DIALVALUE Flags values
 */

#define E_TDVINTEGER    0x01
#define E_TDVFLOAT      0x02
#define E_TDVSTRING     0x03

#define E_TDVFP1        0x10
#define E_TDVFP2        0x11
#define E_TDVFP3        0x12
#define E_TDVFP4        0x13
#define E_TDVFP5        0x14
#define E_TDVFP6        0x15
#define E_TDVFP7        0x16
#define E_TDVFP8        0x17
#define E_TDVFP9        0x18
#define E_TDVFP10       0x19
#define E_TDVFP11       0x1A
#define E_TDVFP12       0x1B
#define E_TDVFP13       0x1C
#define E_TDVFP14       0x1D
#define E_TDVFP15       0x1E
#define E_TDVFP16       0x1F

#define E_TDVVT         0x1F

#define E_TDVSIGNED     0x00
#define E_TDVUNSIGNED   0x20

#define E_TDVNUL        0x0000
#define E_TDVIMM        0x1000
#define E_TDVBUF        0x2000
#define E_TDVIND        0x3000
#define E_TDVFUN        0x4000
#define E_TDVPTR        0x5000

#define E_TDVAM         0x7000

#define E_TDVREADONLY   0x8000

/*
 * 	T_DIALVALUE Indices in dialogue chunks
 */

#define E_IFXPOS        1
#define E_IFYPOS        2
#define E_IFXSIZE       3
#define E_IFYSIZE       4
#define E_IFFLAGS       5
#define E_IFFGCOL       6
#define E_IFBGCOL       7
#define E_IFRETURN      8

#define E_IFTITLE       9
#define E_IFSPRITE      9
#define E_IFFORMAT      9
#define E_IFLIST        9

#define E_IFFONT        10

#define E_IFLENGTH      11
#define E_IFVALUE       11
#define E_IFBORDER      11
#define E_IFSTRING      11
#define E_IFOFFSET      11
#define E_IFINDEX       11
#define E_IFSTARTCOL    11
#define E_IFOBJECT      11
#define E_IFSHAPE       11
#define E_IFOBJTREE     11

#define E_IFROOTCTRL    12
#define E_IFMIN         12
#define E_IFVALID       12
#define E_IFCOLS        12
#define E_IFELEVATION   12
#define E_IFSELECT      12

#define E_IFMAX         13
#define E_IFMAXLEN      13
#define E_IFROWS        13
#define E_IFAZIMUTH     13
#define E_IFDESELECT    13

#define E_IFBASE        14
#define E_IFMAXWIDTH    14
#define E_IFLINEINC     14
#define E_IFENDCOL      14
#define E_IFINC         14
#define E_IFDISTANCE    14

#define E_IFXOFFSET     15
#define E_IFWIDTH       15

#define E_IFYOFFSET     16
#define E_IFMINWIDTH    16

#define E_IFCURSOR      17
#define E_IFPAGEINC     17

#define E_IFBLOCKSTART  18
#define E_IFCHILDREN    18

#define E_IFBLOCKEND    19

#define E_MAXTVALUE     19

/*
 *	Header common to all dialogue items.
 */

typedef struct
{
	unsigned short		ChkType;
	unsigned short		Length;
	short				ItemID;
	short				Child;
	short				Sibling;
	short				NextTab;
	short				PrevTab;
	unsigned short		Update;
	unsigned short		FocusKey;
	T_DIALVALUE			XPos;
	T_DIALVALUE			YPos;
	T_DIALVALUE			XSize;
	T_DIALVALUE			YSize;
	T_DIALVALUE			Flags;
	T_DIALVALUE			FGCol;
	T_DIALVALUE			BGCol;
	T_DIALVALUE			Return;
	T_DIALVALUE			Title;
	T_DIALVALUE			Font;
}	T_DIALCHKHEADER;

/*
 *	Values for T_DIALCHKHEADER.Flags
 */

#define E_MFINVISIBLE   0x40000000
#define E_MFROOT        0x20000000
#define E_MFMENU        0x10000000
#define E_MFGOSUB       0x08000000
#define E_MFEDITABLE    0x04000000
#define E_MFBACKGROUND  0x02000000
#define E_MFFOREGROUND  0x01000000
#define E_MFJUSTB       0x00800000
#define E_MFJUSTT       0x00400000
#define E_MFJUSTR       0x00200000
#define E_MFJUSTL       0x00100000
#define	E_MFDOUBLECLICK	0x00080000
#define	E_MFINDENTED	0x00040000
#define	E_MFSAVEDBG		0x00020000
#define	E_MFHANDLE		0x00010000
#define	E_MFSELECTABLE	0x00008000
#define	E_MFDISABLED	0x00004000
#define	E_MFCHECKED		0x00002000
#define	E_MFRADIO		0x00001000
#define	E_MFOUTLINED	0x00000800
#define	E_MFTOUCHEXIT	0x00000400
#define	E_MFTOUCHSELECT	0x00000200
#define	E_MFINVISCHILD	0x00000100
#define	E_MFSELECTED	0x00000080
#define	E_MFEXIT		0x00000040
#define	E_MFLASTONE		0x00000020
#define	E_MFCLEARSEL	0x00000010
#define	E_MFDEFAULT		0x00000008
#define	E_MFNOHIGH		0x00000004
#define	E_MFGOTO		0x00000002
#define	E_MFNOREDRAW	0x00000001

/*
 * 	Generalised root item.
 *	Control, Menu and Tool dialogue root items are this type.
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Length;
	T_DIALVALUE		RootCtrl;
}	T_DIALROOT;

/*
 *	Root Flags (lower 16 bits of RootCtrl)
 */

#define E_MRRESIDENT	0x0001
#define E_MRNOSAVEBG	0x0002
#define E_MRREFRESH		0x0004
#define E_MRBRINGTOTOP	0x0008
#define E_MRRESAVE		0x0010
#define E_MRBASE		0x0020

/*
 *	Box item
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Border;
}	T_DIALBOX;

/*
 * 	Text item (non-editable)
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
}	T_DIALTEXT;

/*
 *	Editable Number (Numeric) item
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		Base;
}	T_DIALNUMERIC;

#define E_NUMERICDECIMAL        0
#define E_NUMERICFLOAT          1
#define E_NUMERICSCIENTIFIC     2
#define E_NUMERICHEXADECIMAL    3
#define E_NUMERICANGLE          4

/*
 *	Horizontal slider
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Offset;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		LineInc;
	T_DIALVALUE		Width;
	T_DIALVALUE		MinWidth;
	T_DIALVALUE		PageInc;
}	T_DIALHORZSLIDER;

/*
 *	Vertical slider
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Offset;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		LineInc;
	T_DIALVALUE		Width;
	T_DIALVALUE		MinWidth;
	T_DIALVALUE		PageInc;
}	T_DIALVERTSLIDER;

/*
 * 	Editable text line
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		String;
	T_DIALVALUE		Validate;
	T_DIALVALUE		MaxLen;
}	T_DIALTEXTLINE;

/*
 * 	Editable text page
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		String;
	T_DIALVALUE		Validate;
	T_DIALVALUE		MaxLen;
	T_DIALVALUE		MaxWidth;
	T_DIALVALUE		XOffset;
	T_DIALVALUE		YOffset;
	T_DIALVALUE		Cursor;
	T_DIALVALUE		BlockStart;
	T_DIALVALUE		BlockEnd;
}	T_DIALTEXTPAGE;


/*
 * 	Toggle button
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
	T_DIALVALUE		Deselect;
}	T_DIALTOGGLE;

/*
 * 	Check box item
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
	T_DIALVALUE		Deselect;
}	T_DIALCHECKBOX;

/*
 * 	Radio button
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
}	T_DIALRADIO;

/*
 * 	Enumerated Button
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Index;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		Increment;
}	T_DIALENUM;

/*
 * 	List Box
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Index;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
}	T_DIALLISTBOX;

/*
 * 	Colour chart
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		StartCol;
	T_DIALVALUE		Cols;
	T_DIALVALUE		Rows;
	T_DIALVALUE		EndCol;
}	T_DIALCOLCHART;

/*
 * 	Editable object name
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Object;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
}	T_DIALOBJECT;

/*
 * 	Editable shape name
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Shape;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
}	T_DIALSHAPE;

/*
 * 	Menu entry
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
}	T_DIALMENUENTRY;

/*
 * 	Menu entry with cascade
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
}	T_DIALCASCADE;


/*
 * 	Menu entry with drop down
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
}	T_DIALDROPDOWN;


/*
 * 	Menu entry with radio button
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
}	T_DIALRADIOMENU;


/*
 * 	Menu entry with check
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
	T_DIALVALUE		Deselect;
}	T_DIALCHECKMENU;

/*
 * 	Scroll box
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Offset;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		LineInc;
	T_DIALVALUE		Width;
	T_DIALVALUE		MinWidth;
	T_DIALVALUE		PageInc;
	T_DIALVALUE	Children;
}	T_DIALSCROLLBOX;

/*
 * 	Pane
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
}	T_DIALPANE;


/*
 * 	Tab
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Value;
	T_DIALVALUE		Select;
}	T_DIALTAB;

/*
 * 	Object tree
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		ObjTree;
	T_DIALVALUE		Elevation;
	T_DIALVALUE		Azimuth;
	T_DIALVALUE		Distance;
}	T_DIALOBJTREE;

/*
 *	Spin box item (not implemented - do not use)
 *

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		Index;
	T_DIALVALUE		Min;
	T_DIALVALUE		Max;
	T_DIALVALUE		Increment;
	T_DIALVALUE		List;
}	T_DIALSPINBOX;

 */


/*
 * 	Generic item with numbered T_DIALVALUE slots.
 *	(Slots 1 to 10 are within the header.)
 */

typedef struct
{
	T_DIALCHKHEADER	Header;
	T_DIALVALUE		v11;
	T_DIALVALUE		v12;
	T_DIALVALUE		v13;
	T_DIALVALUE		v14;
	T_DIALVALUE		v15;
	T_DIALVALUE		v16;
	T_DIALVALUE		v17;
	T_DIALVALUE		v18;
	T_DIALVALUE		v19;
	T_DIALVALUE		v20;
}	T_DIALDUMMY;

/*
 *	General Dialogue Chunk Union
 */

typedef union
{
	T_DIALCHKHEADER		Header;
	T_DIALBOX			Box;
	T_DIALCASCADE		Cascade;
	T_DIALCHECKBOX		CheckBox;
	T_DIALCHECKMENU		CheckMenu;
	T_DIALCOLCHART		ColChart;
	T_DIALDROPDOWN		DropDown;
	T_DIALDUMMY			Dummy;
	T_DIALENUM			Enumerated;
	T_DIALHORZSLIDER	HorzSlider;
	T_DIALMENUENTRY		MenuEntry;
	T_DIALNUMERIC		Numeric;
	T_DIALOBJECT		Object;
	T_DIALOBJTREE		ObjTree;
	T_DIALPANE			Pane;
	T_DIALRADIO			Radio;
	T_DIALRADIOMENU		RadioMenu;
	T_DIALROOT			Root;
	T_DIALSCROLLBOX		ScrollBox;
	T_DIALSHAPE			Shape;
	T_DIALTAB			Tab;
	T_DIALTEXT			Label;
	T_DIALTEXTLINE		TextLine;
	T_DIALTEXTPAGE		TextPage;
	T_DIALTOGGLE		Toggle;
	T_DIALVERTSLIDER	VertSlider;
}	T_DIALCHUNK;

/*
 * 	Dialogue chunk types
 */

#define E_DIMENU			0x01
#define E_DICONTROL			0x02
#define E_DITOOL			0x03
#define E_DIBOX				0x05
#define E_DITEXT			0x06
#define E_DITOGGLE			0x07
#define E_DITEXTLINE		0x08
#define E_DIOBJECT			0x09
#define E_DISHAPE			0x0A
#define E_DICOLCHART		0x0B
#define E_DIHORZSLIDER		0x0C
#define E_DIVERTSLIDER		0x0D
#define E_DIENUMERATED		0x0E
#define E_DISCROLLBOX		0x0F
#define E_DITEXTPAGE		0x10
#define E_DIOBJTREE			0x11
#define E_DINUMERIC			0x12
#define E_DIRADIO			0x13
#define E_DICHECKBOX		0x14
#define E_DICASCADE			0x15
#define E_DIDROPDOWN		0x16
#define E_DIMENUENTRY		0x17
#define E_DIRADIOMENU		0x18
#define E_DICHECKMENU		0x19
#define E_DIPANE			0x1A
#define E_DITAB				0x1B
#define	E_DILISTBOX			0x1C

#define E_DILAST			E_DILISTBOX

/*
 *	Alert Box values ----------------------------------------------------------
 */

#define	E_ALERTINFO		1	/* Info icon					*/
#define	E_ALERTWARNING	2	/* Warning icon					*/
#define	E_ALERTERROR	3	/* Error icon (stop!)			*/

#define	E_ALERTOK		1	/* OK button					*/
#define	E_ALERTCANCEL	2	/* Cancel button				*/
#define	E_ALERTOKDEFCAN	3	/* OK + Cancel, OK default		*/
#define	E_ALERTOKCANDEF	4	/* OK + Cancel, Cancel default	*/
#define	E_ALERTOKCANCON	5	/* OK + Cancel + Continue		*/
#define	E_ALERTSAVE		6	/* SAVE + Discard + Cancel		*/
#define	E_ALERTREMAP	7	/* REMAP + Leave + Cancel		*/

/*
 *	Dialogue return values ----------------------------------------------------
 */

/* Menu returns			"M"	*/

#define	E_DRMENU		0x4D000000

/* Temporary exit 		"T"	*/

#define	E_DRINSERT		0x54000000
#define	E_DRDELETE		0x54000001
#define	E_DRPREVIOUS	0x54000002
#define	E_DRNEXT		0x54000003
#define	E_DRCHILD		0x54000004
#define	E_DRPARENT		0x54000005
#define	E_DRBEFORE		0x54000006
#define	E_DRAFTER		0x54000007
#define	E_DRFIRST		0x54000008
#define	E_DRLAST		0x54000009
#define	E_DROUTSIDE		0x5400000A

/* Undefined			"U" */

#define	E_DRUNDEF		0x55000000

/* World chunks 		"W"	*/

#define	E_DRSTANDARD	0x57000000
#define E_DRCOLOURS		0x57000001
#define	E_DRDEFCOLS		0x57000002
#define	E_DRROTATIONS	0x57000003
#define	E_DRDISTANCE	0x57000004
#define	E_DRANGVELS		0x57000005
#define	E_DRSCL			0x57000006
#define	E_DRANIMATIONS	0x57000007
#define	E_DRATTACHMENTS	0x5700000B
#define	E_DRSHOOTVEC	0x5700000C
#define	E_DRTEXTINFO	0x5700000D
#define	E_DRLIGHTSOURCE	0x5700000E
#define	E_DRBENDING		0x57000010
#define	E_DRVIEWPOINT	0x57000011
#define	E_DRBUBBLE		0x57000012
#define	E_DRCOLLISION	0x57000014
#define	E_DRINITPOS		0x57000015
#define	E_DRDYNAMICS	0x57000016
#define	E_DRLITCOLS		0x57000017
#define	E_DRDEFLITCOLS	0x57000018
#define	E_DRTEXTURES	0x5700001A
#define	E_DRSORTING		0x5700001B

/* Exit values			"X" */

#define	E_DROK			0x58000001
#define	E_DRCANCEL		0x58000002
#define	E_DREXIT		0x58000003
#define	E_DRCONTINUE	0x58000003	/* == E_DREXIT */
#define	E_DRRESEX1		0x58000004
#define	E_DRRESEX2		0x58000005
#define	E_DRRESEX3		0x58000006
#define	E_DRRESEX4		0x58000007

/*
 *	SCL definitions ---------------------------------------------------
 */

/* SCL Compiler record			*/

typedef struct
{
	char			Name[10];
	short			OpCode;
	char			InOut,Action;
	unsigned short 	Type;
	unsigned char	RetType;					/* Return value type		*/
	unsigned char	ArgType[10];		 		/* Max 10 arguments			*/
} T_COMPILEREC;

/* SCL procedure types 			*/

#define	E_PROCEDURE		0x0000		/* Normal procedure			 */
#define	E_VARIABLE		0x2100		/* Returns addr of variable	 */
#define	E_CONSTANT		0x0100		/* Returns addr of constant	 */
#define	E_POINTER		0x0101		/* Returns a pointer		 */

/* SCL argument/return types	*/

#define	E_SSNONE		0   		/* No return value			 */
#define	E_SSPOINTER		0x40		/* Any pointer (argument)	 */
#define	E_SSRPOINTER	0x41		/* Real pointer (return)	 */
#define	E_SSANY			0xFF		/* Anything at all			 */

/* SCL stack value types		*/

#define	E_SSINTEGER		0  			/* Integer value			 */
#define	E_SSOBJNUM		1			/* Object number			 */
#define	E_SSFIXED		3			/* Fixed point number		 */
#define	E_SSFLOAT 		4			/* Floating point number	 */

#define	E_SSPCHAR		0x40		/* Pointer to... char		 */
#define	E_SSPSHORT		0x41		/* ...short					 */
#define	E_SSPANGLE		0x42		/* ...angle					 */
#define	E_SSPLONG		0x43		/* ...long					 */
#define	E_SSPFIXED		0x44		/* ...fixed point			 */
#define	E_SSPFLOAT		0x45		/* ...floating point		 */
#define	E_SSPOBJNUM		0x46		/* ...object number 		 */

#define	E_SSUNSIGNED	0x08		/* add for ptr to unsigned	 */
#define	E_SSWRITE		0x20		/* add for writeable address */
#define	E_SSINDIRECT	0x80		/* add for ** (eg char **)	 */

/*
 * 	SCL execution and debug flags
 */

#define	E_STACKSIZE		64
#define	E_RETSIZE		64

#define	E_DEBUGSOME		0x01
#define	E_DEBUGALL		0x02
#define	E_DEBUGTHISONE	0x04
#define	E_DEBUGSTRINGS	0x08		/* Display "char *"'s as strings */
#define	E_DEBUGCHARS	0x10		/* Display chars as chars		 */
#define	E_DEBUGHEX		0x20		/* Display values as hex if poss */

typedef void __vrtcall (*T_SCLFUNCPTR)(void);	/* SCL function call */

#define	E_NUMSCLCODES	0x340		/* No. of inbuilt opcodes		 */
#define E_NUMREGCODES	0x100		/* No. of registered opcodes	 */

/*
 * 	SCL message structure
 */

typedef struct
{
	long			Message;
	unsigned short	Sender,Destination;
	void *			Next;
} T_CONMSG;

/*
 * 	Structure of printer driver buffer -------------------------------------
 */

typedef struct
{
	char	Name[20];
	unsigned short	width,height,pagewidth,pageheight,dpix,dpiy,pinsx,pinsy;
	char	Spare[3];
	unsigned char Gamma;
	long	LData2;
	long	Code,Init,LF,LData,Exit;
	char	LOffset,LSize,LFlags;
} T_PRINTER;

/*
 * 	Data converter structures ----------------------------------------------
 */

typedef struct
{
	char Name[32];
	long Flags;
	short Colour;
	short LineType;
}T_CNVLAYER;

typedef struct
{
	short  PointNo;
	double X;
	double Y;
	double Z;
}T_CNVPOINT;

typedef	struct
{
	char	  NumPoints;
	short 	  Special;
	long      Colour;
	T_CNVPOINT Points[1];
}T_CNVFACET;

#define	ConvNextFacet(a)	(T_CNVFACET *)((char *)a+(sizeof(T_CNVFACET)+((a->NumPoints-1)*sizeof(T_CNVPOINT))))

/* Intermediate format structures	*/

struct TS_ELEMENT;
struct TS_CNVSUBOBJECT;

struct TS_CHILD
{
	struct TS_ELEMENT *ChildElement;
	double Child_X,Child_Y,Child_Z;
	double Child_Scale_X,Child_Scale_Y,Child_Scale_Z;
	double Child_Rot_X,Child_Rot_Y,Child_Rot_Z;
	char   UserData[128];
};

struct TS_ELEMENT
{
	char Name[256];
	long Colour;
	short SubObCnt;
	struct TS_CNVSUBOBJECT *SubObjects;
	double OriginX;
	double OriginY;
	double OriginZ;
	double Factor_X;
	double Factor_Y;
	double Factor_Z;
	double Max_X;
	double Max_Y;
	double Max_Z;
	double Min_X;
	double Min_Y;
	double Min_Z;
	double Insert_X,Insert_Y,Insert_Z;
	double Scale_X,Scale_Y,Scale_Z;
	double Rotation_X,Rotation_Y,Rotation_Z;
	short  Flags;
	char   Layer[256];
	short  NumChildren;
	struct TS_CHILD *Children;
	char   UserData[128];
	long   NumFacets;
	short *FacetCols;
};

typedef struct TS_ELEMENT	T_ELEMENT;
typedef struct TS_CHILD 	T_CHILD;

/* Converter flags	*/

#define	E_CNVVERBOSE	0x0001
#define	E_CNVDEBUG		0x0002
#define	E_CNVCUT		0x0004
#define	E_CNVLGHT		0x0008
#define	E_CNVINVALID	0x0010
#define	E_CNVSELECTED	0x0020
#define	E_CNVEXPLODE 	0x0040
#define	E_CNVVGAPAL	 	0x0080
#define	E_CNVDIRCHECK	0x0100
#define	E_CNVASSOCS		0x0200
#define	E_CNVCUBES		0x0400

#define	E_CNVSUBREAL	0x0001
#define	E_CNVSUBGROUP	0x0002
#define	E_CNVSUBINVALID	0x0003

#define	E_CNVPROCFILE	0x0000
#define	E_CNVPROCVRTX	0x0001
#define	E_CNVPROCFCLN	0x0002
#define	E_CNVPROCSHAP	0x0003
#define	E_CNVPROCGRP	0x0004
#define	E_CNVPROCCHLD	0x0005
#define	E_CNVPROCOBJ	0x0006
#define	E_CNVPROCSHAD	0x0007
#define	E_CNVPROCCUT	0x0008
#define	E_CNVPROCDIR	0x0009
#define	E_CNVPROCASSOC	0x000A
#define	E_CNVPROCPREP	0x000B

#define	E_CNVOUTSHAPE	1
#define	E_CNVOUTFACS	12

// Extra stuff to webify SCL file functions
typedef struct
{
	int			Url;
	int			Browser;
} T_SCLFILE;

// Stuff for 3D Manipulator
typedef struct
{
	short		Flags;			//
	short	   *Collision;		// array, first element is count of following entries
	short	   *Shape;			// shape of the 'cuboid' with handles
	T_LONGVECTOR LaserStart;	// start pos of 'laser beam'
	long		LaserLen;		// length of laser beam
	long		LaserCrossX1;	// size of cross at end of beam
	long		LaserCrossX2;
	long		LaserCrossZ1;
	long		LaserCrossZ2;
	short		LaserTarget;	// object hit by laser
} T_MANIP3D;

// Values for flags field:
#define E_M3DACTIVE		 0x0001	// the manipulator is active
#define E_M3DNOROTTARGET 0x0002 // display laser target's unrotated cuboid
#define E_M3DNOCHILDREN  0x0004 // don't move children with parent

// ThumbNail image

typedef struct
{
	unsigned short	ChkType,Length;
	unsigned short	ImageLen, MaskLen;
	unsigned short	ImgEsc, MaskEsc;	// escape words for Run Length Encoding
	unsigned short	UncompLen;
	unsigned short	Spare[3];
	unsigned char	Data[1];
} T_THUMBNAIL;
#define E_CTTHUMBNAIL	0x0001



/*	End of APP_TYPE.H -----------------------------------------------------
 */

#define	APP_TYPE_INCLUDED
#endif

/*-------------------------------------------------------------------------
 */
