/*
 *         Filename		 : APP_API.H
 *         Author		 : C.M.Andrew
 *         Creation date : 13 Dec 94
 *         Last update   : 27 Aug 96 15:10:54
 *         Version number: 00.117
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

#ifndef	APP_API_INCLUDED

#include	<stdio.h>
#include	<stdlib.h>
#include	<stdarg.h>
#include	<setjmp.h>
#include	<time.h>

/*
 *	Device driver/application stuff -------------------------------------------
 */
#define E_NUMDEVFUNCTIONS 	32
#define E_MAXDEVTYPES		10

/* 	Defines and data types for keyboard ---------------------------------------
 */

#define	E_DEVKEYBOARD	0

#define	E_KBIDNONE		0
#define	E_KBIDSTANDARD	1

#define E_KBINSTALL		0
#define E_KBSETUP		1
#define E_KBDEINSTALL	2
#define	E_KBKEYREADY	3
#define	E_KBREADKEY		4

/* 	Defines and data types for 2D pointer device (Mouse) ----------------------
 */

#define	E_DEVMOUSE		1

#define	E_MSIDNONE		0
#define	E_MSIDMICROSOFT	1

#define E_MSINSTALL		0
#define E_MSSETUP		1
#define E_MSDEINSTALL	2
#ifdef WIN32
#define E_MSUPDATE		3
#endif

/*	Defines and data types for graphics device driver -------------------------
 */
#define	E_DEVGRAPHICS	3

#define	E_GRIDNONE		0
#define	E_GRIDTIGA		1
#define	E_GRIDSVGA		2
#define	E_GRIDMCGA		3
#define	E_GRIDD3D		4

#define	E_GRINSTALL		 0
#define	E_GRSETUP		 1
#define	E_GRDEINSTALL	 2
#define	E_GRDRAWSCAN	 3
#define	E_GRDRAWLINE	 4
#define	E_GRDRAWTEXT	 5
#define	E_GRDRAWBACKDROP 6
#define	E_GRDRAWSPRITE	 7
#define	E_GRUNDRAWSPRITE 8
#define	E_GRSCREENDONE	 9
#define E_GRSETPALETTE	 10
#define	E_GRDRAWPOLYGON	 11
#define	E_GRDRAWSORTED	 12
#define	E_GRDRAWUNSORTED 13
#define	E_GRDRAWMODEL	 14
#define E_GRSETSTIPPLES  15
#define E_GRSETSPRITES   16
#define E_GRPRECOPY      17

#ifdef WIN32
#define E_GRSETDC		 18
#define E_GRPALCHANGED	 19

#ifdef WIN_PROFILE
#define E_GRGETDATA  	 20
#endif /* WIN_PROFILE */

#endif /* WIN32 */

#define E_GRPICKOBJ      21
#define E_GRUPDATEOBJ    22
#define E_GRDRAWHORIZON  23
#define E_GETBACKBUFFDC	 24
#define E_RELBACKBUFFDC	 25
#define E_GRSETCONFIG	 26
#define E_GRSETONESPRITE 27

/* 	Defines and types for Timer device ----------------------------------------
 */

#define	E_DEVTIMER		4

#define	E_TMIDNONE		0
#define	E_TMIDSTANDARD	1

#define	E_TMINSTALL		0
#define	E_TMSETUP		1
#define	E_TMDEINSTALL	2
#define	E_TMADDLIST		3
#define	E_TMREMLIST		4
#define	E_TMFASTTIMER	5
#define	E_TMSLOWTIMER	6


/* 	Defines and types for proportional device ---------------------------------
 */

#define	E_DEVPROP		5

#define	E_PRIDNONE		0
#define	E_PRIDSBALL		1
#define	E_PRIDJOYSTICK	2
#define	E_PRIDFLOB		3
#define	E_PRIDFASTRAK	4
#define	E_PRIDSMOUSE	5
#define	E_PRIDMOUSE		6
#define	E_PRID6MOUSE	7
#define	E_PRIDJOYSTICK2	8

#define	E_PRINSTALL		0
#define	E_PRSETUP		1
#define	E_PRDEINSTALL	2
#define	E_PRGETPOS		3


/* 	Defines and types for Sound device ----------------------------------------
 */

#define	E_DEVSOUND		6

#define	E_SDIDNONE		0
#define	E_SDIDMIDI		1
#define	E_SDIDADLIBGOLD	2
#define	E_SDIDSOUNDBL	3
#define	E_SDIDSOUNDBL16	4

#define	E_SDINSTALL		0
#define	E_SDSETUP		1
#define	E_SDDEINSTALL	2
#define	E_SDPLAYSOUND	3
#define	E_SDSHUTUP		4
#define	E_SDRECORD		5
#define	E_SDMODIFY		6
#ifdef WIN32
#define E_SDSENDBLOCK	7
#endif


/* 	Defines and types for Network device --------------------------------------
 */

#define	E_DEVNETWORK	8

#define	E_NTIDNONE		0
#define	E_NTIDCLARKSON	1
#define E_NTNETBIOS		2

#define	E_NTINSTALL		0
#define	E_NTSETUP		1
#define	E_NTDEINSTALL	2
#define	E_NTNETWORK		3
#define	E_NTRESIGN		4


/* 	Defines and types for Serial device --------------------------------------
 */

#define	E_DEVSERIAL		9

#define	E_SRIDNONE		0
#define	E_SRIDDEFAULT	1

#define	E_SRINSTALL		0
#define	E_SRSETUP		1
#define	E_SRDEINSTALL	2
#define	E_SRSETUPPORT	3
#define	E_SRRELEASEPORT	4
#define	E_SRSENDBYTES	5
#define	E_SRGETBYTES	6
#define	E_SRSETCALLBACK	7
#define	E_SRCLRCALLBACK	8
#define	E_SRFLUSHBUF	9
#define	E_SRGETPORTINFO	10


/*
 *	API Export table ------------------------------------------------------
 */

typedef struct
{
	FILE *	__vrtcall (*Export_fopen	)(const char *filename,const char *mode);
	FILE *	__vrtcall (*Export_freopen	)(const char *filename, const char *mode, FILE *stream);
	int		__vrtcall (*Export_fflush	)(FILE *stream);
	int		__vrtcall (*Export_fclose	)(FILE *stream);
	int		__vrtcall (*Export_remove	)(const char *filename);
	int		__vrtcall (*Export_rename	)(const char *oldname,const char *newname);
	FILE *	__vrtcall (*Export_tmpfile	)(void);
	char *	__vrtcall (*Export_tmpnam	)(char s[L_tmpnam]);
	int		__vrtcall (*Export_setvbuf	)(FILE *stream,char *buf,int mode,size_t size);
	void	__vrtcall (*Export_setbuf	)(FILE *stream,char *buf);
	int		__vrtcall (*Export_vprintf	)(const char *format,va_list arg);
	int		__vrtcall (*Export_vfprintf	)(FILE *stream,const char *format,va_list arg);
	int		__vrtcall (*Export_vsprintf	)(char *s,const char *format,va_list arg);
	int		__vrtcall (*Export_vscanf	)(const char *format,va_list arg);
	int		__vrtcall (*Export_vfscanf	)(FILE *stream,const char *format,va_list arg);
	int		__vrtcall (*Export_vsscanf	)(const char *s,const char *format,va_list arg);
	int		__vrtcall (*Export_fgetc	)(FILE *stream);
	char *	__vrtcall (*Export_fgets	)(char *s,int n,FILE *stream);
	int		__vrtcall (*Export_fputc	)(int c,FILE *stream);
	int		__vrtcall (*Export_fputs	)(const char *s,FILE *stream);
	int		__vrtcall (*Export_getc		)(FILE *stream);
	int		__vrtcall (*Export_getchar	)(void);
	char *	__vrtcall (*Export_gets		)(char *s);
	int		__vrtcall (*Export_putc		)(int c,FILE *stream);
	int		__vrtcall (*Export_putchar	)(int c);
	int		__vrtcall (*Export_puts		)(const char *s);
	int		__vrtcall (*Export_ungetc	)(int c,FILE *stream);
	size_t	__vrtcall (*Export_fread	)(void *ptr, size_t size, size_t nobj, FILE *stream);
	size_t	__vrtcall (*Export_fwrite	)(const void *ptr, size_t size, size_t nobj, FILE *stream);
	int		__vrtcall (*Export_fseek	)(FILE *stream,long offset,int origin);
	long	__vrtcall (*Export_ftell	)(FILE *stream);
	void	__vrtcall (*Export_rewind	)(FILE *stream);
	int		__vrtcall (*Export_fgetpos	)(FILE *stream, fpos_t *ptr);
	int		__vrtcall (*Export_fsetpos	)(FILE *stream, const fpos_t *ptr);
	void	__vrtcall (*Export_clearerr	)(FILE *stream);
	int		__vrtcall (*Export_feof		)(FILE *stream);
	int		__vrtcall (*Export_ferror	)(FILE *stream);
	void	__vrtcall (*Export_perror	)(const char *s);

	int		__vrtcall (*Export_isalnum	)(int c);
	int		__vrtcall (*Export_isalpha	)(int c);
	int		__vrtcall (*Export_iscntrl	)(int c);
	int		__vrtcall (*Export_isdigit	)(int c);
	int		__vrtcall (*Export_isgraph	)(int c);
	int		__vrtcall (*Export_islower	)(int c);
	int		__vrtcall (*Export_isprint	)(int c);
	int		__vrtcall (*Export_ispunct	)(int c);
	int		__vrtcall (*Export_isspace	)(int c);
	int		__vrtcall (*Export_isupper	)(int c);
	int		__vrtcall (*Export_isxdigit	)(int c);
	int		__vrtcall (*Export_tolower	)(int c);
	int		__vrtcall (*Export_toupper	)(int c);

	char *	__vrtcall (*Export_strcpy	)(char *s,const char *ct);
	char *	__vrtcall (*Export_strncpy	)(char *s,const char *ct,size_t n);
	char *	__vrtcall (*Export_strcat	)(char *s,const char *ct);
	char *	__vrtcall (*Export_strncat	)(char *s,const char *ct,size_t n);
	int		__vrtcall (*Export_strcmp	)(const char *cs,const char *ct);
	int		__vrtcall (*Export_strncmp	)(const char *cs,const char *ct,size_t n);
	char *	__vrtcall (*Export_strchr	)(const char *cs,int c);
	char *	__vrtcall (*Export_strrchr	)(const char *cs,int c);
	size_t	__vrtcall (*Export_strspn	)(const char *cs,const char *ct);
	size_t	__vrtcall (*Export_strcspn	)(const char *cs,const char *ct);
	char *	__vrtcall (*Export_strpbrk	)(const char *cs,const char *ct);
	char *	__vrtcall (*Export_strstr	)(const char *cs,const char *ct);
	size_t	__vrtcall (*Export_strlen	)(const char *cs);
	char *	__vrtcall (*Export_strerror	)(int n);
	char *	__vrtcall (*Export_strtok	)(char *s,const char *ct);
	void *	__vrtcall (*Export_memcpy	)(char *s,const char *ct,size_t n);
	void *	__vrtcall (*Export_memmove	)(char *s,const char *ct,size_t n);
	int		__vrtcall (*Export_memcmp	)(const char *cs,const char *ct,size_t n);
	void *	__vrtcall (*Export_memchr	)(const char *cs,char c,size_t n);
	void *	__vrtcall (*Export_memset	)(char *s,char c,size_t n);

	SS_DBL	__vrtcall (*Export_sin		)(double x);
	SS_DBL	__vrtcall (*Export_cos		)(double x);
	SS_DBL	__vrtcall (*Export_tan		)(double x);
	SS_DBL	__vrtcall (*Export_asin		)(double x);
	SS_DBL	__vrtcall (*Export_acos		)(double x);
	SS_DBL	__vrtcall (*Export_atan		)(double x);
	SS_DBL	__vrtcall (*Export_atan2	)(double x,double y);
	SS_DBL	__vrtcall (*Export_sinh		)(double x);
	SS_DBL	__vrtcall (*Export_cosh		)(double x);
	SS_DBL	__vrtcall (*Export_tanh		)(double x);
	SS_DBL	__vrtcall (*Export_exp		)(double x);
	SS_DBL	__vrtcall (*Export_log		)(double x);
	SS_DBL	__vrtcall (*Export_log10	)(double x);
	SS_DBL	__vrtcall (*Export_pow		)(double x,double y);
	SS_DBL	__vrtcall (*Export_sqrt		)(double x);
	SS_DBL	__vrtcall (*Export_ceil		)(double x);
	SS_DBL	__vrtcall (*Export_floor	)(double x);
	SS_DBL	__vrtcall (*Export_fabs		)(double x);
	SS_DBL	__vrtcall (*Export_ldexp	)(double x,int n);
	SS_DBL	__vrtcall (*Export_frexp	)(double x,int *exp);
	SS_DBL	__vrtcall (*Export_modf		)(double x,double *ip);
	SS_DBL	__vrtcall (*Export_fmod		)(double x,double y);

	SS_DBL	__vrtcall (*Export_atof		)(const char *s);
	int		__vrtcall (*Export_atoi		)(const char *s);
	long	__vrtcall (*Export_atol		)(const char *s);
	SS_DBL	__vrtcall (*Export_strtod	)(const char *s,char **endp);
	long	__vrtcall (*Export_strtol	)(const char *s,char **endp,int base);
	unsigned long
			__vrtcall (*Export_strtoul	)(const char *s,char **endp,int base);
	int		__vrtcall (*Export_rand		)(void);
	void	__vrtcall (*Export_srand	)(unsigned int seed);
	void *	__vrtcall (*Export_calloc	)(size_t nobj,size_t size);
	void *	__vrtcall (*Export_malloc	)(size_t size);
	void *	__vrtcall (*Export_realloc	)(void *p, size_t size);
	void	__vrtcall (*Export_free		)(void *p);
	void	__vrtcall (*Export_abort	)(void);
	void	__vrtcall (*Export_exit		)(int status);
	int		__vrtcall (*Export_atexit	)(void (*fcn)(void));
	int		__vrtcall (*Export_system	)(const char *s);
	char *	__vrtcall (*Export_getenv	)(const char *name);
	void *	__vrtcall (*Export_bsearch	)(const void *key, const void *base, size_t n, size_t size,
			  							int (*cmp)(const void *keyval1,const void *datum));
	void	__vrtcall (*Export_qsort	)(void *base,size_t n,size_t size,int(*cmp)(const void *,const void *));
	int		__vrtcall (*Export_abs		)(int n);
	long	__vrtcall (*Export_labs		)(long n);
	div_t	__vrtcall (*Export_div		)(int num,int denom);
	ldiv_t	__vrtcall (*Export_ldiv		)(long num,long denom);

	int		__vrtcall (*Export_setjmp	)(jmp_buf env);
	void	__vrtcall (*Export_longjmp	)(jmp_buf env,int val);

	void (* __vrtcall (*Export_signal	)(int sig,void (*handler)(int)))(int);
	int		__vrtcall (*Export_raise	)(int sig);

	clock_t	__vrtcall (*Export_clock	)(void);
	time_t	__vrtcall (*Export_time		)(time_t *exp);
	SS_DBL	__vrtcall (*Export_difftime	)(time_t time2, time_t time1);
	time_t	__vrtcall (*Export_mktime	)(struct tm *tp);
	char *	__vrtcall (*Export_asctime	)(const struct tm *tp);
	char *	__vrtcall (*Export_ctime	)(const time_t *tp);
	struct tm *
			__vrtcall (*Export_gmtime	)(const time_t *tp);
	size_t	__vrtcall (*Export_strftime	)(char *s,size_t smax,const char *fmt,const struct tm *tp);

	short			   *Export_8087;
	short			   *Export_fltused;
	SS_DBL	__vrtcall (*Export___CHP    )(double x);

} T_APIEXPORTS;

typedef struct
{
	short	Error;
	char	Name[30];

} T_APIRETURN;

typedef struct
{
	char *Name;
	char *Description;
	void * __vrtcall (*CallBack)(long Reason,void *Data);
} T_APISHARE;

/*
 *	API Vector table and related equates --------------------------------------
 */

typedef struct
{

	/*
	 * Vectors into VRT (called by API)
	 */

	void	__vrtcall (*_Init)(T_WORLDCHUNK *Root,T_SHAPECHUNK *Shape);
	void	__vrtcall (*_InitSCL)(T_WORLDCHUNK *SCL);
	void	__vrtcall (*_InitViewPoints)(T_WORLDCHUNK *p);

	void	__vrtcall (*_Process)(T_WORLDCHUNK *Tree);
	void	__vrtcall (*_MatMult)(T_MATRIX m1,T_MATRIX m2, T_MATRIX Result);
	void	__vrtcall (*_MatMake)(short XRot, short YRot, short ZRot, T_MATRIX Result);
	void	__vrtcall (*_MatMakeInv)(short XRot, short YRot, short ZRot, T_MATRIX Result);
	void	__vrtcall (*_RotatePoint)(T_POINTREC3D *Point, T_MATRIX Matrix, short Type);
	void	__vrtcall (*_RotatePointLong)(T_LONGVECTOR *Point,T_MATRIX Matrix, short Type);

	T_DCOBJECT * __vrtcall (*_SortTree)(void);

	void	__vrtcall (*_Draw)(void *Tree);
	void	__vrtcall (*_ClearScreen)(void);
	void	__vrtcall (*_ClearWindow)(void);
	void	__vrtcall (*_ScreenDraw)(void);
	void 	__vrtcall (*_DrawPolygon)(T_GRPOLYGON *Polygon);
	void	__vrtcall (*_DrawRectangle)(short x1,short y1,short x2,short y2,
						      unsigned char Colour);
	void	__vrtcall (*_DrawInstruments)(short WindowNumber);
	void 	__vrtcall (*_Text)(short x,short y,unsigned char FGColour,
					 unsigned char BGColour,short FontID, short MaxLen,
					 short Align, unsigned char Flags,char *String);

	void	__vrtcall (*_UpdateWorld)(T_WORLDCHUNK *Tree);
	void	__vrtcall (*_UpdateViewPoint)(void);

	void	__vrtcall (*_ExecuteSCL)(T_WORLDCHUNK *Tree);
	short	__vrtcall (*_Execute)(unsigned char *Conditions);
	void 	__vrtcall (*_PushN)(short t, long v);
	void 	__vrtcall (*_PushF)(short t, float v);
	void 	__vrtcall (*_PushP)(short t, void *v);
	long  	__vrtcall (*_PopN)(short t);
	float 	__vrtcall (*_PopF)(short t);

	long	__vrtcall (*_BLoad)(char *FileName,void *LoadAddress,long MaxLength);
	long	__vrtcall (*_BSave)(char *FileName,void *SaveAddress,long Length);
	long	__vrtcall (*_GetFileLength)(char *FileName);
	char **	__vrtcall (*_GetFileList)(char *PathName, char *Buffer, short BufLen);
	char *	__vrtcall (*_FileSelector)(char *Path,char *FileName,char *Title,long FileTypes);
	void	__vrtcall (*_SplitPath)(char *FileName,char *Path,char *File);
	long	__vrtcall (*_LoadSS)(char *FileName,char *LoadAddress,long MaxLength,
				char *Type,char Mode);
	long	__vrtcall (*_SaveSS)(char *FileName,char *SaveAddress,long Length,
				char *Type,char Mode);
	long	__vrtcall (*_SaveVRT)(char *FileName,short Flags,char Mode);
	long	__vrtcall (*_GetLenSS)(char *FileName,char *Type,char Mode);
	char *	__vrtcall (*_GetFileName)(char *FileName,char *Type);

	char *	__vrtcall (*_LongToDec)(long n,char *String,short Length);
	char *	__vrtcall (*_LongToHex)(long n,char *String,short Length);
	char *	__vrtcall (*_LongToBin)(long n,char *String,short Length);
	char *	__vrtcall (*_AscToLong)(long *n,char *String,short Base,char MaxChar);
	char *	__vrtcall (*_DecToLong)(long *n,char *String);
	char *	__vrtcall (*_HexToLong)(long *n,char *String);
	char *	__vrtcall (*_BinToLong)(long *n,char *String);

	long	__vrtcall (*_Random)(long Seed);
	short	__vrtcall (*_ArcSin)(short Value);
	short	__vrtcall (*_ArcCos)(short Value);
	short	__vrtcall (*_ArcTan)(long Num,long Denom);

	void	__vrtcall (*_FindFacet)(short pX, short pY, T_OBJFAC *pObjFac,
				  unsigned short Exclude);

	void	__vrtcall (*_AbsPosition)(long *x,long *y,long*z,short Object,char Lock,
					short *xr,short *yr,short *zr);
	short	__vrtcall (*_FindBearing)(long x,long y,long z,short *XRot);
	void	__vrtcall (*_FindOffset)(short Object, short PointNum, long *x,long *y,long *z);
	void	__vrtcall (*_SetViewpoint)(short VPNum);

	T_PICKITEM * __vrtcall (*_Pick)(char *Title,T_PICKITEM *PickList,short Mode, T_PICKITEM * (*FilterFunction)(T_PICKITEM *));
	short 	 __vrtcall(*_SaveScreen)(short Format);

	/*
	 * 	EditLine and EditScreen are no longer available.
	 */

	void	__vrtcall (*_EditLine)(void);
	void	__vrtcall (*_EditScreen)(void);

	T_DIALCHUNK * __vrtcall (*_FindDial)(char *DialName);
	void	__vrtcall (*_DrawPropMenu)(char *DialName);
	long	__vrtcall (*_Dialogue)(char *DialName);
	long	__vrtcall (*_PopUpDialogue)(char *DialName);
	long	__vrtcall (*_CentreDialogue)(char *DialName);
	void	__vrtcall (*_FillInShortCuts)(char *DialName);
	void	__vrtcall (*_UpdateDialogue)(char *DialName, short Item, short MaxKids);

	short 	__vrtcall (*_Compile)(char *String,unsigned char *SCL,T_OBJSYM *Comment,
		  			T_OBJSYM *VarName);
	short 	__vrtcall (*_Decompile)(unsigned char *SCL,char *Text,char *EndText,
		  			T_OBJSYM *Comment, T_OBJSYM *VarName);

	short	__vrtcall (*_ReInsert)(char  *Ptr, long Length, long PrevLength,
			                       char  *End, char *Buffer, long BufUsed);
	void	__vrtcall (*_GetFunctions)(void);
	void	__vrtcall (*_WriteFunc)(long Function,short Param);

	long	__vrtcall (*_ProcessFunctions)(void(*Func)(long));
	void	__vrtcall (*_ObeyFunction)(long FuncNum);

	void	__vrtcall (*_MouseOn)(void);
	void	__vrtcall (*_MouseOff)(void);

	void			__vrtcall (*_Terminate    )(short ErrorCode);
	T_WORLDCHUNK *	__vrtcall (*_ChunkAdd     )(short Object,unsigned short ChkType);
	short			__vrtcall (*_RegisterSCL  )(T_COMPILEREC *CRec,void __vrtcall (*Function)(void));
	short			__vrtcall (*_UnRegisterSCL)(short OpCode);

	/* Vectors to API (called from VRT)	*/

	void	__vrtcall (*_UnknownFunction)(long FuncNum);
	void	__vrtcall (*_UnknownInstr   )(T_INSTRUMENT *Ins);
	void	__vrtcall (*_UnknownDialItem)(void *DialItem);
	void	__vrtcall (*_UnknownWChunk  )(T_WORLDCHUNK *Chunk);
	void	__vrtcall (*_UnknownSChunk  )(T_SHAPECHUNK *Chunk);

	void	__vrtcall (*_VecB4Init      )(void);
	void	__vrtcall (*_VecAFInit      )(void);
	void	__vrtcall (*_VecVisEntry	)(void);
	void	__vrtcall (*_VecB4GetFunc   )(void);
	void	__vrtcall (*_VecAFGetFunc   )(void);
	void	__vrtcall (*_VecB4DoFunc    )(void);
	void	__vrtcall (*_VecAFDoFunc    )(void);
	void	__vrtcall (*_VecB4Update    )(void);
	void	__vrtcall (*_VecB4SCL       )(void);
	void	__vrtcall (*_VecB4Render    )(void);
	void	__vrtcall (*_VecB4Process   )(void);
	void	__vrtcall (*_VecB4Sort      )(void);
	void	__vrtcall (*_VecB4Instrs    )(void);
	void	__vrtcall (*_VecB4ScreenSwap)(void);
	void	__vrtcall (*_VecB4Draw      )(void);
	void	__vrtcall (*_VecAFDraw      )(void);
	void	__vrtcall (*_VecAFRender    )(void);
	void	__vrtcall (*_VecVisExit		)(void);

	/* Addresses of common data 		*/

	T_CONSOLE *		_C_Console;
	short * 		_C_PlayerView;
	short *			_C_Player;
	short *			_C_ThisPlayer;
	volatile T_MSPOS **_C_MousePos;
	T_GRSPRITE **	_C_Sprite;
	T_GRSPRITE **	_C_UserSprite;
	short *			_C_NumSprites;
	short *			_C_NumUserSprites;
	volatile long **_C_MonoTime;
	char **			_C_ErrorString;
	void **			_C_ErrorAddress;
	char **			_C_MessBuffer;
	char **			_C_WorldBuffer;
	char **			_C_ShapeBuffer;
	char **			_C_ConfigBuffer;
	char **			_C_PalBuffer;
	char **			_C_BackBuffer;
	char **			_C_ResourceBuffer;
	char **			_C_UserRsrcBuffer;
	char **			_C_SpriteBuffer;
	char **			_C_UserSprBuffer;
	char **			_C_Spr0SaveBuffer;
	char **			_C_SprSaveBuffer;
	char **			_C_UserSprSaveBuf;
	char **			_C_FontBuffer;
	char **			_C_PrefsBuffer;
	char **			_C_UndoBuffer;
	char **			_C_ViewPtBuffer;
	long *			_C_MessBufLength;
	long *			_C_WorldBufLength;
	long *			_C_ShapeBufLength;
	long *			_C_ConfigBufLength;
	long *			_C_PalBufLength;
	long *			_C_BackBufLength;
	long *			_C_ResourceBufLength;
	long *			_C_UserRsrcBufLength;
	long *			_C_SpriteBufLength;
	long *			_C_UserSprBufLength;
	long *			_C_FontBufLength;
	long *			_C_PrefsBufLength;
	long *			_C_UndoBufLength;
	long *			_C_ViewPtBufLength;
	char **			_C_WorldSym;
	char **			_C_ShapeSym;
	char **			_C_EditBuffer;
	short *			_C_FilesChanged;
	char **			_C_UndoHead;
	long *			_C_DevLen;
	long *			_C_ConfigLen;
	long *			_C_WorldLen;
	long *			_C_ShapeLen;
	long *			_C_PalLen;
	long *			_C_BackLen;
	long *			_C_MessLen;
	long *			_C_ResourceLen;
	long *			_C_UserRsrcLen;
	long *			_C_SpriteLen;
	long *			_C_UserSprLen;
	long *			_C_FontLen;
	long *			_C_PrefsLen;
	char **		    _C_DialSaveBuf;
	char **			_C_LastDialName;
	char **			_C_Palette;
	char **			_C_Stipples;
	char **			_C_ColRanges;
	long *			_C_Triggers;
	char *			_C_Markers;
	long *			_C_Counters;
	T_LONGORPTR	*	_C_InsVal;
	T_LONGORPTR	*	_C_InsVal2;
	unsigned char **_C_UserFunc;
	short *			_C_DevsInstalled;
	T_STDFUNCPTR **	_C_BaseAddress;
	short *			_C_SinTable;
	char **			_C_ErrorMessage;

	/* Additional pointers */

	void * __vrtcall (*_PopP)(short t);

	/*
	 *	New stuff for VRT3 --------------------------------------------------
	 */

	T_FUNCTION *	_C_FuncBuf;
	short *			_C_FuncBufHead;
	short *			_C_FuncBufTail;
	unsigned char **_C_DrawList;
	unsigned char **_C_DrawRoot;
	unsigned char **_C_DrawAdd;
	long *			_C_DrawListSize;
	short *			_C_FacetCount;

	char **			_C_SysMessBuffer;
	long *			_C_SysMessBufLength;
	long *			_C_SysMessLen;

	char **			_C_SoundBuffer;
	long *			_C_SoundBufLength;
	long *			_C_SoundLen;
	T_SDINSTALLRET **_C_SoundReturn;
	short *			_C_SoundDevice;
	short *			_C_StartSoundDevice;
	char **			_C_SoundParams;
	char **			_C_SoundName;
	char *			_C_SoundOn;

	unsigned char **_C_CurrentPalette;
	unsigned char *	_C_ClearColour;
	short *			_C_Activated;
	unsigned short *_C_AbsTime;
	char *			_C_TextureScale;
	T_MATRIX *		_C_ViewMatrix;
	T_GRSETUP **	_C_ScreenParams;
	char *			_C_CopyFlag;
	T_GRRECT *		_C_ScreenSave;

	unsigned char *	_C_Ambient;
	unsigned char *	_C_IAmbient;

	T_CONMSG **		_C_MsgHead;
	T_CONMSG **		_C_MsgTail;
	T_CONMSG **		_C_MsgFree;

	FILE **			_C_SCLFiles;
	unsigned char **_C_SCLPC;
	unsigned char **_C_SCLDefVarAdd;
	unsigned char **_C_SCLResumeAdd;
	short *			_C_SCLSP;
	short *			_C_SCLRSP;
	short *			_C_SCLParamIndex;
	short *			_C_SCLError;
	short *			_C_SCLType;
	T_LONGORPTR	*	_C_SCLStack;
	T_LONGORPTR	*	_C_SCLReturnStack;
	long *			_C_DebugSCL;
	short *			_C_SCLChkType;

	unsigned char *	_C_SkyCol;
	unsigned char *	_C_SkyBands;
	unsigned char *	_C_SkyGrad;
	unsigned char *	_C_GndCol;
	unsigned char *	_C_GndBands;
	unsigned char *	_C_GndGrad;

	unsigned char *	_C_BufferClear;

	unsigned char *	_C_Resolution;
	unsigned char *	_C_DefResolution;

	short *			_C_AngleSize;
	long *			_C_StepSize;

	T_LONGVECTOR **	_C_ViewPosition;

	short *			_C_NumPlayers;

	char *			_C_CurrentVP;
	char *			_C_VPType;

	short *			_C_PropParam;

	long *			_C_DiskFlags;

	volatile T_KBINSTALLRET **_C_Keyboard;
	char **			_C_KeyTable;

	T_PRINSTALLRET **_C_PropReturn;
	short *			_C_PropAxes;
	short *			_C_PropDevice;
	short *			_C_StartPropDevice;
	short *			_C_StartPropId;
	char **			_C_PropName;
	char **			_C_PropDial;
	short *			_C_PropId;
	char *			_C_PropOn;
	char *			_C_PropData;

	char *			_C_Year;
	char *			_C_Month;
	char *			_C_Day;
	char *			_C_Hour;
	char *			_C_Minute;
	char *			_C_Second;

	unsigned short *_C_LayerFlags;

	short *			_C_DetailLevel;

	T_LIGHT *		_C_Light;
	T_LIGHTSOURCE **_C_SunLight;
	short *			_C_NumLights;

	char *			_C_WhereAmI;

	short *			_C_Increment;
	short *			_C_IncStep;

	char *			_C_Failed;

	char **			_C_PrinterBuffer;
	long *			_C_PrinterBufLength;

	char **			_C_ClipBoard;
	char *			_C_ClipOwner;
	long *			_C_ClipLen;

	T_POINTREC2D *	_C_BackPos;

	char *			_C_DevPath;
	char *			_C_DevFile;	// Deprecated
	char *			_C_ConfigPath;
	char *			_C_ConfigFile;
	char *			_C_WorldPath;
	char *			_C_WorldFile;
	char *			_C_ShapePath;
	char *			_C_ShapeFile;
	char *			_C_BackPath;
	char *			_C_BackFile;
	char *			_C_SoundPath;
	char *			_C_SoundFile;
	char *			_C_SysMessPath;
	char *			_C_SysMessFile;
	char *			_C_MessPath;
	char *			_C_MessFile;
	char *			_C_ResourcePath;
	char *			_C_ResourceFile;
	char *			_C_UserRsrcPath;
	char *			_C_UserRsrcFile;
	char *			_C_PalPath;
	char *			_C_PalFile;
	char *			_C_SpritePath;
	char *			_C_SpriteFile;
	char *			_C_UserSprPath;
	char *			_C_UserSprFile;
	char *			_C_FontPath;
	char *			_C_FontFile;
	char *			_C_PrefsPath;
	char *			_C_PrefsFile;
	char **			_C_BackName;

	short *			_C_NumDialogues;
	short *			_C_NumUserDials;
	char **			_C_PropMenu;

	char **			_C_OldPalette;
	char *			_C_RangeOn;
	unsigned char *	_C_FirstPal;
	unsigned char *	_C_LastPal;

	long *			_C_Triggers2;

	T_TIMENODE **	_C_TimerA;
	T_TIMENODE **	_C_TimerB;
	T_TIMENODE **	_C_TimerC;
	T_TIMENODE **	_C_TimerD;

	void ***		_C_ShapeAdd;

	char **			_C_SysMess;
	char **			_C_Message;

	T_FUNCNAME *	_C_FuncNames;
	short *			_C_FuncNameSize;



	short 	__vrtcall (*_ResizeScreen)	(char Resolution);
	void	__vrtcall (*_VisError)		(char *String);

	void	__vrtcall (*_AddDrawChunk)	(short Type,void *Data,short Length,char Flush,short Buffer);
	void	__vrtcall (*_AddRectangle)	(short x1,short y1,short x2,short y2,
							 	 unsigned char Colour,unsigned char Type);
	void	__vrtcall (*_AddText)			(short x,short y,unsigned char FGColour,
							 	 unsigned char BGColour,short FontID,
								 short MaxLen,short Align,unsigned char Flags,
								 char *String);

	char *	__vrtcall (*_LongToAsc)		(long n,char *String,short Length,long *Power,
								 short NumPowers);

	long	__vrtcall (*_SquareRoot)	(long n);

	long	__vrtcall (*_SaveWorld)		(void);
	long	__vrtcall (*_LoadWorld)		(void);
	long	__vrtcall (*_ClearWorld)	(void);
	long	__vrtcall (*_SaveShape)		(void);
	long	__vrtcall (*_LoadShape)		(void);
	long	__vrtcall (*_ClearShape)	(void);
	long	__vrtcall (*_SavePalette)	(void);
	long	__vrtcall (*_LoadPalette)	(void);
	long	__vrtcall (*_ClearPalette)	(void);
	long	__vrtcall (*_SaveUserSprites)	(void);
	long	__vrtcall (*_LoadUserSprites)	(void);
	long	__vrtcall (*_ClearUserSprites)	(void);
	long	__vrtcall (*_SaveUserRsrc)	(void);
	long	__vrtcall (*_LoadUserRsrc)	(void);
	long	__vrtcall (*_ClearUserRsrc)	(void);
	long	__vrtcall (*_SaveMessages)	(void);
	long	__vrtcall (*_LoadMessages)	(void);
	long	__vrtcall (*_ClearMessages)	(void);
	long	__vrtcall (*_SaveSounds)	(void);
	long	__vrtcall (*_LoadSounds)	(void);
	long	__vrtcall (*_ClearSounds)	(void);
	long	__vrtcall (*_LoadBackdrop)	(short Number);
	long	__vrtcall (*_SaveConfig)	(void);
	long	__vrtcall (*_SavePrefs)		(void);

	void	__vrtcall (*_PrintScreen)	(void);
	void	__vrtcall (*_ChoosePrinter)	(void);

	T_OBJSYM * __vrtcall (*_GetSym)		(short ObjNum,short Chk);
	T_OBJSYM * __vrtcall (*_GetShapeSym)	(short ShpNum,short Chk);
	T_OBJSYM * __vrtcall (*_GetSymList)	(short Number,short Chk,T_OBJSYM *s);

	short	__vrtcall (*_GetSCLLength)	(unsigned char *SCL);

	void	__vrtcall (*_FlushUndoBuf)	(void);

	void	__vrtcall (*_CheckRepeat)		(long Function,short Param);

	/*
	 *	New stuff for VRT3.50 ------------------------------------------------
	 */

	short *				_C_KeyboardDD;
	short * 			_C_MouseDD;
	short *				_C_JoyDD;
	short *				_C_GraphicsDD;
	short *				_C_TimerDD;
	short *				_C_PropDD;
	short *				_C_NetworkDD;

	char **				_C_DeviceName;
	char **				_C_DeviceDial;
	unsigned char **	_C_DeviceEnabled;
	unsigned char **	_C_DeviceActive;
	T_PROPSETUP **		_C_DeviceSetup;
	unsigned char *		_C_NumDevsActive;
	unsigned char *		_C_DeviceID;

	unsigned short *	_C_VersionMajor;
	unsigned short *	_C_VersionMinor;
	char *				_C_VersionRev;
	char *				_C_VersionDate;

	T_DEVINSTALL *		_C_DevInstall;

	short *				_C_PropButtons;
	short *				_C_SerialDD;

	/*
	 *	New stuff for VRT4.00 ------------------------------------------------
	 */

	short  __vrtcall (*_RegisterDev)(T_STDFUNCPTR *Functions,short Type);
	short  __vrtcall (*_ReRegisterDev)(T_STDFUNCPTR *Functions,short Type,short Slot);
	short  __vrtcall (*_RegisterDevFunc)(T_STDFUNCPTR Function,short Type,short Slot,short EntryNum);

	short *				_C_MouseMode;
	short *				_C_MouseMode2;
	T_POINTREC2D *		_C_MouseHomePos;

	short __vrtcall (*_CreateVRTPalette)	(char *pBuffer,short PalNum);
	short __vrtcall (*_DeleteVRTPalette)	(short PalNum);
	short __vrtcall (*_CreateVRTObject)		(char *pBuffer,char *pName,short ObjNum);
	short __vrtcall (*_DeleteVRTObject)		(short ObjNum);
	short __vrtcall (*_CreateVRTShape)		(char *pBuffer,char *pName,short ShpNum);
	short __vrtcall (*_DeleteVRTShape)		(short ShpNum);
	short __vrtcall (*_CreateVRTWindow)		(char *pBuffer,short WinNum);
	short __vrtcall (*_DeleteVRTWindow)		(short WinNum);
	short __vrtcall (*_CreateVRTInstrument)	(char *pBuffer,short Console,short InstNum);
	short __vrtcall (*_DeleteVRTInstrument)	(short Console,short InstNum);
	short __vrtcall (*_CreateVRTIcon)		(char *pBuffer,short IconTable,short IconNum);
	short __vrtcall (*_DeleteVRTIcon)		(short IconTable,short IconNum);
	short __vrtcall (*_CreateVRTSprite)		(char *pBuffer,char *pName,short SprNum);
	short __vrtcall (*_DeleteVRTSprite)		(short SprNum);
	short __vrtcall (*_CreateVRTDial)		(char *pBuffer,char *pName);
	short __vrtcall (*_DeleteVRTDial)		(char *pName);
	short __vrtcall (*_CreateVRTSound)		(char *pBuffer,char *pName,short SndNum);
	short __vrtcall (*_DeleteVRTSound)		(short SndNum);

	T_DOSVECTOR __vrtcall (*_GetDosVector)(short VecNum);
	void  		__vrtcall (*_SetDosVector)(short VecNum,T_DOSVECTOR FuncPtr);

	short *		 _C_DllNumber;
	short 		 __vrtcall (*_RegisterShare)(short DllNumber, T_APISHARE *ShareInfo);
	T_APISHARE * __vrtcall (*_GetShare)(char *Name);

	char *		 _C_ProductCode;
	char *		 _C_SuppressFileErr;

/*
 *  These vectors must be filled in by the image library DLL
 */
	long	__vrtcall (*_ImageAlloc)	(T_IMAGEINFO *ImageInfo);
	long	__vrtcall (*_ImageFree)		(T_IMAGEINFO *ImageInfo);
	long	__vrtcall (*_ImageLoad)		(char *Filename,T_IMAGEINFO *ImageInfo);
	long	__vrtcall (*_ImageSave)		(char *Filename,T_IMAGEINFO *ImageInfo,char Type);
	long	__vrtcall (*_ImagePalette)	(char *Filename,unsigned char *Palette);

	/* Routine to load or reinitialise image library	*/

	short	__vrtcall (*_ImageLoadLibrary)(void);

	short	__vrtcall (*_FFT)(float *Real, float *Imag, long Pwr, short Dir);

	long *		 _C_MonitorMode;

	long	__vrtcall (*_Alert)(char *String, short Type, short Buttons);
	char *	__vrtcall (*_EnumToAsc)(long n,char *String,short Length,char *EnumString);

	/*
	 * 	Pointers to SCL functions.
	 */

	T_SCLFUNCPTR *_C_SCLFunctions;
	T_SCLFUNCPTR *_C_RegSCLFunctions;

/*
 *  USE THESE SPARE ENTRIES FOR THINGS COMMON TO BOTH VRT AND VISULAISER
 */

	void *		 _Spare1[1];

/*
 *  ONLY PUT ENTRIES THAT ONLY APPLY TO THE VRT (NOT THE VISUALISER) AFTER
 *  HERE
 */

	/*
	 *  Stuff for Data Converter interface
	 */

	long	__vrtcall (*_Conv_Element)			(T_ELEMENT *pElement);
	short	__vrtcall (*_Conv_CheckBreak)		(void);
	void	__vrtcall (*_Conv_Fatal)			(char *Error);
	void	__vrtcall (*_Conv_ShowProgress)		(void);
	void	__vrtcall (*_Conv_UpdateProgress)	(void);
	void	__vrtcall (*_Conv_HideProgress)		(void);
	void	__vrtcall (*_Conv_CleanUpElement)		(void);
	void	__vrtcall (*_Conv_InitElement)		(void);
	void *	__vrtcall (*_Conv_ElementAllocMem)	(size_t size, long Length);
	void *	__vrtcall (*_Conv_ElementReallocMem)	(void *p, size_t size);
	T_ELEMENT * __vrtcall (*_Conv_FindElement)		(char *Name);
	T_STANDARD * __vrtcall (*_Conv_MakeWorldObject)	(T_ELEMENT *Element, long MyParent, long PrevSib, T_ELEMENT *ParElement);
	void	__vrtcall (*_Conv_ElementDeallocMem)	(void *p);
	void	__vrtcall (*_Conv_Message)			(char *Message);
	long	__vrtcall (*_Conv_RemapColour)		(unsigned char r, unsigned char g, unsigned char b, unsigned char a);
	T_CNVFACET * __vrtcall (*_Conv_NewFacet)	(short NumPoints);
	void	__vrtcall (*_Conv_RemoveFacet)		(long FacetNo);
	T_CNVLAYER * __vrtcall (*_Conv_NewLayer)	(void);
	void	__vrtcall (*_Conv_RemoveLayer)		(long LayerNo);
	T_ELEMENT * __vrtcall (*_Conv_NewElement)		(void);
	void	__vrtcall (*_Conv_RemoveElement)		(char *ElementName);
	T_CHILD * __vrtcall (*_Conv_NewChild)		(char *ElementName);
	void	__vrtcall (*_Conv_RemoveChild)		(char *ElementName, long ChildNo);

	/*
	 *  These vectors must be filled in by the data converter DLL
	 */

	long	__vrtcall (*_Conv_Open)				(char *filename);
	long	__vrtcall (*_Conv_FirstPass)		(void);
	long	__vrtcall (*_Conv_Scan)				(void);
	long	__vrtcall (*_Conv_Close)			(void);
	void	__vrtcall (*_Conv_ModifyPosition)	(T_ELEMENT *Element, T_ELEMENT *ParElement);
	void	__vrtcall (*_Conv_SkipElement)		(void);
	short	__vrtcall (*_Conv_Validate)			(char *filename);

	short *				_C_CNVPass;
	char *				_C_CNV_FName;

	long * 				_C_CNV3DFace_Cnt;
	T_CNVFACET **		_C_CNV3DFace_List;

	double * 			_C_CNV_Arc_Iterations;

	char *   			_C_CNVElement_NAME;
	T_ELEMENT **			_C_CNVElementList;
	long   *			_C_CNVElementCnt;

	double *   			_C_CNVWorld_Scale;
	T_CNVLAYER **		_C_CNVLayers;
	long * 				_C_CNVLayerCnt;
	long * 				_C_CNVLast_Child;

	long   *			_C_CNVRotXCen;
	long   *			_C_CNVRotYCen;
	long   *			_C_CNVRotZCen;

	char * 				_C_CNVProcess;
	short *				_C_CNVFlags;

	long *				_C_CNVPercentage_Complete;

/*
 *  USE THESE SPARE ENTRIES FOR THINGS THAT APPLY ONLY TO THE VRT (NOT
 *  THE VISUALISER)
 */
	void *				_Spare2[20];

/*
 * Windows extras so you can modify menus, draw on top of
 * the bitmap, resize windows etc.
 * _WINDOWS is defined in windows.h to access these names
 */

#ifdef _WINDOWS
    HWND *              _C_hMainFrame;
    HWND *              _C_hView;
    HDC *               _C_hDC;
#else
    long                _Dummy[3];  /* to make sure the offsets are correct */
#endif

/*
 * 	New text editor routines
 */
 	void *	__vrtcall	(*_CreateTextBlock)(char *Title,char *Text,long MaxLen,unsigned short Flags);
	long	__vrtcall	(*_EditTextBlock)(void* Handle);
	void	__vrtcall	(*_SetTextBlockCursor)(void *Handle,long CursorPos,long BlockStart,long BlockEnd);
	void	__vrtcall	(*_SetTextBlockErrorStrings)(void *Handle,char *ErrorString1,char *ErrorString2,char *ErrorString3);
	void	__vrtcall	(*_DestroyTextBlock)(void *Handle);

	short	__vrtcall	(*_CloseDialogue)(char *DialName);

/*
 * Viscape extras so that SCL routines can talk to the browser.
 */

#ifdef _WINDOWS
	HWND *				_C_hwndPlugin;
// Extra stuff to webify SCL file functions
	T_SCLFILE *			_C_SCLFileFlags;
	void *				_Spare3[2];
#else
    void *              _Dummy2[4]; /* to make sure the offsets are correct */
#endif

/*
 * More Windows-specific entries
 */

#ifdef _WINDOWS
	HWND *				_C_WinOpenDialog;
	void *				Spare4[15];
#else
	void *				_Dummy3[16]; /* to make sure the offsets are correct */
#endif

/*
 *  New stuff for VRT 5-00
 */
	T_EXTRACONFIG		** _C_ExtraConfig;
	T_EXTRACONFIG		** _C_PrefsExtraConfig;
	unsigned char		 * _C_ObjChanged;		
	T_WORLDCHUNK		** _C_SelectedObject;
	T_EDITCONFIG		** _C_EditorPrefs;
	T_MANIP3D			 * _C_Manip3D;
	long				 * _C_SystemInfo;

/*
 * New stuff for Long Filename support (5-50)
 */
	char				 * _C_LongConfigPath;
	char				 * _C_LongConfigFile;
	char				 * _C_LongWorldPath;
	char				 * _C_LongWorldFile;
	char				 * _C_LongShapePath;
	char				 * _C_LongShapeFile;
	char				 * _C_LongBackPath;
	char				 * _C_LongBackFile;
	char				 * _C_LongSoundPath;
	char				 * _C_LongSoundFile;
	char				 * _C_LongMessPath;
	char				 * _C_LongMessFile;
	char				 * _C_LongResourcePath;
	char				 * _C_LongResourceFile;
	char				 * _C_LongUserRsrcPath;
	char				 * _C_LongUserRsrcFile;
	char				 * _C_LongPalPath;
	char				 * _C_LongPalFile;
	char				 * _C_LongUserSprPath;
	char				 * _C_LongUserSprFile;
	char				 * _C_LongFontPath;
	char				 * _C_LongFontFile;
	char				 * _C_LongPrefsPath;
	char				 * _C_LongPrefsFile;
	char				 * _C_LongAppPath;
	char				 * _C_LongAppFile;
	char				 * _C_LongConvPath;
	char				 * _C_LongConvFile;
	char				 * _C_LongConvModPath;
	char				 * _C_LongConvModFile;

/*
 * New entry to give address to the entity chunk
 */
	T_ENTITY *	__vrtcall	(*_GetEntityFromObject)(short nObject);

/*
 *  New stuff for VRT 5-60
 */
	void			__vrtcall (*_RelPosition)(long *x,long *y,long *z,short Object);
	void			__vrtcall (*_RelRotation)(short *XR,short *YR,short *ZR,short Object);
	void			__vrtcall (*_Orientation)(short obj,short *XR,short *YR,short *ZR);
	void			__vrtcall (*_Horizon)(void);
	short			*_C_ZPlane;
	short			*_C_ZPlaneScale;
	short			*_C_Plane;
	T_VIEW			**_C_ViewList;
	T_WORLDCHUNK	***_C_List;
	short			*_C_MaxChunk;

/*
 *  New stuff for VRT 5-70
 */
	short __vrtcall (*_CreateVRTSpriteWithPalette)(char *pBuffer,char *pName,short SprNum,unsigned char *pPalette);
	int	  __vrtcall (*_RemoveSpriteColour)(unsigned int Colour,int SprNum,int bUseFirst16);

} T_APIVECTORS;


#define	APP_API_INCLUDED
#endif

/*-------------------------------------------------------------------------
 */
