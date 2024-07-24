/*
 *         Filename		 : APP_LIB.C
 *         Author		 : Sean T Ellis
 *         Creation date : 13 Dec 94
 *         Last update   : 27 Aug 96 15:12:07
 *         Version number: 00.168
 *
 *	Function: To define the linkage between the VRT and the SDK
 *
 *	(c) Copyright Superscape VR plc 1995. All rights reserved.
 *
 *-------------------------------------------------------------------------
 *
 *	INCLUDES --------------------------------------------------------------
 */

#define __NO_MATH_OPS

#include	"APP_DEFS.H"

#include	<math.h>

#ifdef USE_STD_CRT
BOOL WINAPI _CRT_INIT(HINSTANCE hinstDLL,DWORD fdwReason,LPVOID lpReserved);
#endif

#ifdef WINVIS

#ifndef USE_STD_CRT
/*
 * Normally, these functions are intrinsic instead of function
 * calls for speed, but for this file they need to be functions
 * because that is what is expected by the SDK.
 *
 * Note that I don't include any of the SDK aliases for functions as
 * this actually prevents the DLL from loading if they are aliased.
 * I assume that this is because one of them fails for some reason
 * during the DLL linking with other shared C libraries?
 */

#ifndef _DEBUG
#pragma	function(strcpy,strcat,strcmp,strlen,memcpy,memcmp,memset)
#pragma function(sin,cos,tan,asin,acos,atan,atan2,sinh,cosh,tanh,exp,log,log10)
#pragma function(pow,sqrt,fabs,fmod,abs,labs)
#endif

#endif	// !USE_STD_CRT

#else
	#define	IMPORT_FILE_FUNCS	1
	#define	IMPORT_CHAR_FUNCS	1
	#define	IMPORT_STRING_FUNCS	1
	#define	IMPORT_MATH_FUNCS	1
	#define	IMPORT_UTIL_FUNCS	1
	#define	IMPORT_JUMP_FUNCS	1
	#define	IMPORT_SIGNAL_FUNCS	1
	#define	IMPORT_TIME_FUNCS	1
#endif

/*	DEFINED FUNCTION PROTOTYPES -------------------------------------------
 */

__vrtexport
T_APIRETURN *__vrtcall APIEntryPoint(T_APIEXPORTS *pAPIExports,
						   			 T_APIVECTORS *pAPIVectors,
						   			 short		   Reason);
__vrtexport
int __stdcall DllEntryPoint(void *hDll,unsigned long Reason, void *Reserved);

/*	EXTERNAL FUNCTION PROTOTYPES ------------------------------------------
 */

extern short App_Init(void);
extern short App_Exit(void);

/*	EXTERNAL VARIABLES ----------------------------------------------------
 */

/*	INTERNAL FUNCTION PROTOTYPES ------------------------------------------
 */

/*-------------------------------------------------------------------------
 *
 *	DECLARATIONS ----------------------------------------------------------
 */

#ifndef USE_STD_CRT
T_APIEXPORTS *API_Exports;
#endif	// !USE_STD_CRT

T_APIVECTORS *API_Vectors,
			  API_Old_Vectors;
T_APIRETURN	  API_Return={0,"Not named"};

#ifdef _WINDOWS
	HINSTANCE     C_hinstDLL = NULL;
#endif

/*
 * Defines etc. for WATCOM C/C++ ------------------------------------------
 *
 *	NOTE THAT YOU MUST NOT DEFINE FUNCTION BODIES WITHIN THIS SECTION - DECLARE
 *	PROTOTYPES AND PLACE THE FUNCTION BODIES AT THE END. DllEntryPoint MUST
 *	BE THE FIRST DEFINED FUNCTION IN THE MODULE.
 */

#ifdef __WATCOMC__

#ifndef USE_STD_CRT
	/* Define variables for use with floating point library, and aliases */

	short	__8087;
	short	_fltused_;

	#define	__vrt8087 		__8087
	#define	__vrtfltused	_fltused_

	/* Deal with storing data segment for interrupt routines to use		 */

	short		__vrtds;

	void		__vrtgetds_f(void);
	#pragma aux __vrtgetds_f = \
		"mov ds,cs:__vrtds"  ;

	void		__vrtsetds_f(void);
	#pragma aux __vrtsetds_f = \
		"mov __vrtds,ds"	 ;

	void		__CHP(void);
	#pragma aux __CHP \
		modify [eax ebx ecx edx esi edi];


	void __vrtchp(void);
	#pragma aux __vrtchp \
		modify [eax ebx ecx edx esi edi]		\
		= \
		"push eax"		\
		"wait"			\
		"fstcw [esp]"	\
		"wait"			\
		"push [esp]"	\
		"mov byte ptr +1[esp],0x1F"	\
		"fldcw [esp]"	\
		"frndint"		\
		"fldcw +4[esp]"	\
		"wait"			\
		"lea esp,+8[esp]";

	void __GETDS(void);

	#define	__vrtsetds	__vrtsetds_f()
#endif	//!USE_STD_CRT

#endif

/*
 * Defines etc. for Visual C++ --------------------------------------------
 */

#ifdef _MSC_VER

#ifndef USE_STD_CRT
	/* Define dummy variables and aliases 								 */

	short	_8087;
	short	_fltused;

	#define	__vrt8087	 	_8087
	#define	__vrtfltused	_fltused

	#define	__vrtsetds

	/* declarations for library conflicts */

	void Exit(int status);
	char *GetEnv(const char *name);
#endif	// !USE_STD_CRT

#endif

/*
 * Defines etc. for Borland C++ -------------------------------------------
 */

#ifdef __BORLANDC__

#ifndef USE_STD_CRT
	/* Define dummy variables and aliases 								 */

	short	_8087;
	short	_fltused;

	#define	__vrt8087	 	_8087
	#define	__vrtfltused	_fltused

	#define	__vrtsetds
#endif	// !USE_STD_CRT

#endif

/*	DEFINED FUNCTIONS -----------------------------------------------------
 */

__vrtexport
int __stdcall DllEntryPoint(void *hDll,unsigned long Reason, void *Reserved)
{
	/* Dummy DllEntryPoint to fool VRT loader */

	/*
	 * Save away a copy of the DLL instance handle
	 */

#ifdef USE_STD_CRT
	if(Reason==DLL_PROCESS_ATTACH||Reason==DLL_THREAD_ATTACH)
		if(!_CRT_INIT(hDll,Reason,Reserved)) return FALSE;
#endif

#ifdef _WINDOWS
	C_hinstDLL = hDll;
#endif

	/*
	 *	Today's fussy compilers insist that we use the parameters in a
	 *	sensible way. This if statement always returns 1, but does so
	 *	by testing all the parameters passed to the function. Since
	 *	DllEntryPoint is only ever called once, this is not a problem.
	 *
	 *	It is just possible that a really intelligent optimiser might
	 *	spot that this is redundant code, and complain.
	 */

	#ifdef USE_STD_CRT
	if(Reason==DLL_PROCESS_DETACH||Reason==DLL_THREAD_DETACH)
		if(!_CRT_INIT(hDll,Reason,Reserved)) return FALSE;
	#endif

	if(hDll==NULL && Reserved==NULL && Reason==1)
		return(Reason);		/* Reason is always 1 here so that's OK	*/
	else
		return(1);
}

/*
 * Function called on entry and exit (exit with NULL pointers, reason!=0)
 */

__vrtexport
T_APIRETURN * __vrtcall APIEntryPoint(T_APIEXPORTS *pAPIExports,
								      T_APIVECTORS *pAPIVectors,
						   			  short		 	Reason)
{
	if(Reason==0)
	{
#ifndef USE_STD_CRT
		/* Set data segment for interrupt routines to use 			*/

		__vrtsetds;

		/* Make local copies of export and vector table pointers	*/

		API_Exports=pAPIExports;
#endif	// !USE_STD_CRT

		API_Vectors=pAPIVectors;

#ifndef USE_STD_CRT
		/* Copy floating point variables (into dummies if not used)	*/

		if(API_Exports->Export_8087!=NULL)
			__vrt8087=*(API_Exports->Export_8087);
		else
			__vrt8087=0;

		if(API_Exports->Export_fltused!=NULL)
			__vrtfltused=*(API_Exports->Export_fltused);
		else
			__vrtfltused=0;
#endif	// !USE_STD_CRT

		/* Make copy of original vector table						*/

		API_Old_Vectors=*API_Vectors;

		/* Call user App_Init routine and save error status			*/

		API_Return.Error=App_Init();

		/* If all is not well, restore the old vector table			*/

		if(API_Return.Error!=E_OK)
			*API_Vectors=API_Old_Vectors;
	}
	else
	{
		/* Call user App_Exit routine and save error status			*/

		API_Return.Error=App_Exit();

		/* And restore the old vector table							*/

		*API_Vectors=API_Old_Vectors;
	}

	return(&API_Return);
}

/*
 *	Redirection functions for all exported library routines
 */

/*
 * File functions (K&R B.1) -------------------------------------------------
 */

#ifndef USE_STD_CRT

#if IMPORT_FILE_FUNCS

/* File operations (K&R B.1.1)										*/

FILE *fopen(const char *filename,const char *mode)
{ return(API_Exports->Export_fopen(filename,mode)); }

FILE *freopen(const char *filename, const char *mode, FILE *stream)
{ return(API_Exports->Export_freopen(filename,mode,stream));}

int fflush(FILE *stream)
{ return(API_Exports->Export_fflush(stream));}

int fclose(FILE *stream)
{ return(API_Exports->Export_fclose(stream)); }

int remove(const char *filename)
{ return(API_Exports->Export_remove(filename));}

int rename(const char *oldname,const char *newname)
{ return(API_Exports->Export_rename(newname,oldname));}

FILE *tmpfile(void)
{ return(API_Exports->Export_tmpfile());}

char *tmpnam(char s[L_tmpnam])
{ return(API_Exports->Export_tmpnam(s));}

int setvbuf(FILE *stream,char *buf,int mode,size_t size)
{ return(API_Exports->Export_setvbuf(stream,buf,mode,size));}

void setbuf(FILE *stream,char *buf)
{ API_Exports->Export_setbuf(stream,buf);}

/* Formatted output (K&R B.1.2)										*/

int printf(const char *format, ...)
{
/*  Don't pass through to VRT as printf doesn't work on graphics screens.
 *ÿÿIf formatted ouptut is required, use sprintf for formatting and VRT
 *  routine Text to display output.
 *
 *  va_list	arg;
 *ÿÿint		Return;
 *ÿÿva_start(arg,format);
 *ÿÿReturn=API_Exports->Export_vprintf(format,arg);
 *ÿÿva_end(arg); // Is this necessary????
 *ÿÿreturn(Return);
 */
	format=format;
	return(-1);
}

int fprintf(FILE *stream,const char *format, ...)
{
	va_list	arg;
	int		Return;
	va_start(arg,format);
#ifdef __WATCOMC__
	Return=API_Exports->Export_vfprintf(stream,format,arg);
#else
	Return=API_Exports->Export_vfprintf(stream,format,(char *)&arg);
#endif
	va_end(arg);
	return(Return);
}

int sprintf(char *s,const char *format, ...)
{
	va_list	arg;
	int		Return;
	va_start(arg,format);
#ifdef __WATCOMC__
	Return=API_Exports->Export_vsprintf(s,format,arg);
#else
	Return=API_Exports->Export_vsprintf(s,format,(char *)&arg);
#endif
	va_end(arg);
	return(Return);
}

int vprintf(const char *format,va_list arg)
{ return(API_Exports->Export_vprintf(format,arg)); }

int vfprintf(FILE *stream,const char *format,va_list arg)
{ return(API_Exports->Export_vfprintf(stream,format,arg)); }

int vsprintf(char *s,const char *format,va_list arg)
{ return(API_Exports->Export_vsprintf(s,format,arg)); }

/* Formatted input (K&R B.1.3)										*/

int scanf(const char *format, ...)
{
	va_list	arg;
	int		Return;
	va_start(arg,format);
#ifdef __WATCOMC__
	Return=API_Exports->Export_vscanf(format,arg);
#else
	Return=API_Exports->Export_vscanf(format,(char *)&arg);
#endif
	va_end(arg);
	return(Return);
}

int fscanf(FILE *stream,const char *format, ...)
{
	va_list	arg;
	int		Return;
	va_start(arg,format);
#ifdef __WATCOMC__
	Return=API_Exports->Export_vfscanf(stream,format,arg);
#else
	Return=API_Exports->Export_vfscanf(stream,format,(char *)&arg);
#endif
	va_end(arg);
	return(Return);
}

int sscanf(const char *s,const char *format, ...)
{
	va_list	arg;
	int		Return;
	va_start(arg,format);
#ifdef __WATCOMC__
	Return=API_Exports->Export_vsscanf(s,format,arg);
#else
	Return=API_Exports->Export_vsscanf(s,format,(char *)&arg);
#endif
	va_end(arg);
	return(Return);
}

/* Character I/O functions (K&R B.1.4)								*/

int fgetc(FILE *stream)
{ return(API_Exports->Export_fgetc(stream));}

char *fgets(char *s,int n,FILE *stream)
{ return(API_Exports->Export_fgets(s,n,stream));}

int fputc(int c,FILE *stream)
{ return(API_Exports->Export_fputc(c,stream));}

int fputs(const char *s,FILE *stream)
{ return(API_Exports->Export_fputs(s,stream));}

#undef getc

int getc(FILE *stream)
{ return(API_Exports->Export_getc(stream));}

#undef getchar

int getchar(void)
{ return(API_Exports->Export_getchar());}

char *gets(char *s)
{ return(API_Exports->Export_gets(s));}

#undef putc

int putc(int c,FILE *stream)
{ return(API_Exports->Export_putc(c,stream));}

#undef putchar

int putchar(int c)
{ return(API_Exports->Export_putchar(c));}

#undef puts

int puts(const char *s)
{ return(API_Exports->Export_puts(s));}

#undef ungetc

int ungetc(int c,FILE *stream)
{ return(API_Exports->Export_ungetc(c,stream));}


/* Direct I/O functions (K&R B.1.5)									*/

size_t fread(void *ptr, size_t size, size_t nobj, FILE *stream)
{ return(API_Exports->Export_fread(ptr,size,nobj,stream)); }

size_t fwrite(const void *ptr, size_t size, size_t nobj, FILE *stream)
{ return(API_Exports->Export_fwrite(ptr,size,nobj,stream)); }


/* File positioning functons (K&R B.1.6)							*/

int fseek(FILE *stream,long offset,int origin)
{ return(API_Exports->Export_fseek(stream,offset,origin));}

long ftell(FILE *stream)
{ return(API_Exports->Export_ftell(stream));}

void rewind(FILE *stream)
{ API_Exports->Export_rewind(stream);}

int fgetpos(FILE *stream, fpos_t *ptr)
{ return(API_Exports->Export_fgetpos(stream,ptr));}

int fsetpos(FILE *stream, const fpos_t *ptr)
{ return(API_Exports->Export_fsetpos(stream,ptr));}


/* File error functions (K&R B.1.7)									*/

#undef clearerr

void clearerr(FILE *stream)
{ API_Exports->Export_clearerr(stream);}

#undef feof

int feof(FILE *stream)
{ return(API_Exports->Export_feof(stream));}

#undef ferror

int ferror(FILE *stream)
{ return(API_Exports->Export_ferror(stream));}

void perror(const char *s)
{ API_Exports->Export_perror(s);}

#endif

/*
 *	End of file functions ----------------------------------------------------
 */

/*
 *	Character class tests (K&R B.2) ------------------------------------------
 */

#if IMPORT_CHAR_FUNCS

#undef isalnum

int isalnum(int c)
{ return(API_Exports->Export_isalnum(c));}

#undef isalpha

int isalpha(int c)
{ return(API_Exports->Export_isalpha(c));}

#undef iscntrl

int iscntrl(int c)
{ return(API_Exports->Export_iscntrl(c));}

#undef isdigit

int isdigit(int c)
{ return(API_Exports->Export_isdigit(c));}

#undef isgraph

int isgraph(int c)
{ return(API_Exports->Export_isgraph(c));}

#undef islower

int islower(int c)
{ return(API_Exports->Export_islower(c));}

#undef isprint

int isprint(int c)
{ return(API_Exports->Export_isprint(c));}

#undef ispunct

int ispunct(int c)
{ return(API_Exports->Export_ispunct(c));}

#undef isspace

int isspace(int c)
{ return(API_Exports->Export_isspace(c));}

#undef isupper

int isupper(int c)
{ return(API_Exports->Export_isupper(c));}

#undef isxdigit

int isxdigit(int c)
{ return(API_Exports->Export_isxdigit(c));}

#undef tolower

int tolower(int c)
{ return(API_Exports->Export_tolower(c));}

#undef toupper

int toupper(int c)
{ return(API_Exports->Export_toupper(c));}

#endif

/*
 *	End of char functions ----------------------------------------------------
 */


/*
 *	String functions (K&R B.3) -----------------------------------------------
 */

#if IMPORT_STRING_FUNCS

char *strcpy(char *s,const char *ct)
{ return(API_Exports->Export_strcpy(s,ct));}

char *strncpy(char *s,const char *ct,size_t n)
{ return(API_Exports->Export_strncpy(s,ct,n));}

char *strcat(char *s,const char *ct)
{ return(API_Exports->Export_strcat(s,ct));}

char *strncat(char *s,const char *ct,size_t n)
{ return(API_Exports->Export_strncat(s,ct,n));}

int strcmp(const char *cs,const char *ct)
{ return(API_Exports->Export_strcmp(cs,ct));}

int strncmp(const char *cs,const char *ct,size_t n)
{ return(API_Exports->Export_strncmp(cs,ct,n));}

char *strchr(const char *cs,int c)
{ return(API_Exports->Export_strchr(cs,c));}

char *strrchr(const char *cs,int c)
{ return(API_Exports->Export_strrchr(cs,c));}

size_t strspn(const char *cs,const char *ct)
{ return(API_Exports->Export_strspn(cs,ct));}

size_t strcspn(const char *cs,const char *ct)
{ return(API_Exports->Export_strcspn(cs,ct));}

char *strpbrk(const char *cs,const char *ct)
{ return(API_Exports->Export_strpbrk(cs,ct));}

char *strstr(const char *cs,const char *ct)
{ return(API_Exports->Export_strstr(cs,ct));}

size_t strlen(const char *cs)
{ return(API_Exports->Export_strlen(cs));}

char *strerror(int n)
{ return(API_Exports->Export_strerror(n));}

char *strtok(char *s,const char *ct)
{ return(API_Exports->Export_strtok(s,ct));}

void *memcpy(char *s,const char *ct,size_t n)
{ return(API_Exports->Export_memcpy(s,ct,n));}

void *memmove(char *s,const char *ct,size_t n)
{ return(API_Exports->Export_memmove(s,ct,n));}

int memcmp(const char *cs,const char *ct,size_t n)
{ return(API_Exports->Export_memcmp(cs,ct,n));}

#ifdef __WATCOMC__

void *memchr(const char *cs,char c,size_t n)
{ return(API_Exports->Export_memchr(cs,c,n));}

void *memset(char *s,char c,size_t n)
{ return(API_Exports->Export_memset(s,c,n));}

#else

void *memchr(const char *cs,int c,size_t n)
{ return(API_Exports->Export_memchr(cs,(char)c,n));}

void *memset(char *s,int c,size_t n)
{ return(API_Exports->Export_memset(s,(char)c,n));}

#endif

#endif

/*
 *	End of string functions --------------------------------------------------
 */

/*
 *	Math functions (K&R B.4) -------------------------------------------------
 */

#if IMPORT_MATH_FUNCS

double sin(double x)
{
	SS_DBL	d = API_Exports->Export_sin(x);
	return(GET_SS_DBL(d));
}

double cos(double x)
{
	SS_DBL	d = API_Exports->Export_cos(x);
	return(GET_SS_DBL(d));
}

double tan(double x)
{
	SS_DBL	d = API_Exports->Export_tan(x);
	return(GET_SS_DBL(d));
}

double asin(double x)
{
	SS_DBL	d = API_Exports->Export_asin(x);
	return(GET_SS_DBL(d));
}

double acos(double x)
{
	SS_DBL	d = API_Exports->Export_acos(x);
	return(GET_SS_DBL(d));
}

double atan(double x)
{
	SS_DBL	d = API_Exports->Export_atan(x);
	return(GET_SS_DBL(d));
}

double atan2(double x,double y)
{
	SS_DBL	d = API_Exports->Export_atan2(x,y);
	return(GET_SS_DBL(d));
}

double sinh(double x)
{
	SS_DBL	d = API_Exports->Export_sinh(x);
	return(GET_SS_DBL(d));
}

double cosh(double x)
{
	SS_DBL	d = API_Exports->Export_cosh(x);
	return(GET_SS_DBL(d));
}

double tanh(double x)
{
	SS_DBL	d = API_Exports->Export_tanh(x);
	return(GET_SS_DBL(d));
}

double exp(double x)
{
	SS_DBL	d = API_Exports->Export_exp(x);
	return(GET_SS_DBL(d));
}

double log(double x)
{
	SS_DBL	d = API_Exports->Export_log(x);
	return(GET_SS_DBL(d));
}

double log10(double x)
{
	SS_DBL	d = API_Exports->Export_log10(x);
	return(GET_SS_DBL(d));
}

double pow(double x,double y)
{
	SS_DBL	d = API_Exports->Export_pow(x,y);
	return(GET_SS_DBL(d));
}

double sqrt(double x)
{
	SS_DBL	d = API_Exports->Export_sqrt(x);
	return(GET_SS_DBL(d));
}

double ceil(double x)
{
	SS_DBL	d = API_Exports->Export_ceil(x);
	return(GET_SS_DBL(d));
}

double floor(double x)
{
	SS_DBL	d = API_Exports->Export_floor(x);
	return(GET_SS_DBL(d));
}

double fabs(double x)
{
	SS_DBL	d = API_Exports->Export_fabs(x);
	return(GET_SS_DBL(d));
}

double ldexp(double x,int n)
{
	SS_DBL	d = API_Exports->Export_ldexp(x,n);
	return(GET_SS_DBL(d));
}

double frexp(double x,int *exp)
{
	SS_DBL	d = API_Exports->Export_frexp(x,exp);
	return(GET_SS_DBL(d));
}

double modf(double x,double *ip)
{
	SS_DBL	d = API_Exports->Export_modf(x,ip);
	return(GET_SS_DBL(d));
}

double fmod(double x,double y)
{
	SS_DBL	d = API_Exports->Export_fmod(x,y);
	return(GET_SS_DBL(d));
}

#endif

/*
 *	End of math functions ----------------------------------------------------
 */

/*
 *	Utility functions (K&R B.5) ----------------------------------------------
 */

#if IMPORT_UTIL_FUNCS

#undef atof

double atof(const char *s)
{
	SS_DBL	d = API_Exports->Export_atof(s);
	return(GET_SS_DBL(d));
}

#undef atoi

int atoi(const char *s)
{ return(API_Exports->Export_atoi(s));}

#undef atol

long atol(const char *s)
{ return(API_Exports->Export_atol(s));}

#undef strtod

double strtod(const char *s,char **endp)
{
	SS_DBL	d = API_Exports->Export_strtod(s,endp);
	return(GET_SS_DBL(d));
}

long strtol(const char *s,char **endp,int base)
{ return(API_Exports->Export_strtol(s,endp,base));}

unsigned long strtoul(const char *s,char **endp,int base)
{ return(API_Exports->Export_strtoul(s,endp,base));}

int rand(void)
{ return(API_Exports->Export_rand());}

void srand(unsigned int seed)
{ API_Exports->Export_srand(seed);}

void *calloc(size_t nobj,size_t size)
{ return(API_Exports->Export_calloc(nobj,size));}

void *malloc(size_t size)
{ return(API_Exports->Export_malloc(size));}

void *realloc(void *p, size_t size)
{ return(API_Exports->Export_realloc(p,size));}

void free(void *p)
{ API_Exports->Export_free(p);}

void abort(void)
{ API_Exports->Export_abort();}

#ifdef WIN32
void Exit(int status)
{ API_Exports->Export_exit(status);}
#else
void _exit(int status)
{ API_Exports->Export_exit(status);}
#endif /* WIN32 */

int atexit(void (*fcn)(void))
{ return(API_Exports->Export_atexit(fcn));}

int system(const char *s)
{ return(API_Exports->Export_system(s));}

#ifdef WIN32
char *GetEnv(const char *name)
{ return(API_Exports->Export_getenv(name));}
#else
char *getenv(const char *name)
{ return(API_Exports->Export_getenv(name));}
#endif /* WIN32 */

void *bsearch(const void *key, const void *base, size_t n, size_t size,
			  int (*cmp)(const void *keyval1,const void *datum))
{ return(API_Exports->Export_bsearch(key,base,n,size,cmp));}

void qsort(void *base,size_t n,size_t size,int(*cmp)(const void *,const void *))
{ API_Exports->Export_qsort(base,n,size,cmp);}

/* Borland C++ complains of multiple definitions for __abs__ */

#ifndef __BORLANDC__

int abs(int n)
{ return(API_Exports->Export_abs(n));}

#endif

long labs(long n)
{ return(API_Exports->Export_labs(n));}

div_t div(int num,int denom)
{ return(API_Exports->Export_div(num,denom));}

ldiv_t ldiv(long num,long denom)
{ return(API_Exports->Export_ldiv(num,denom));}

#endif

/*
 *	End of utility functions -------------------------------------------------
 */

/*
 *	Diagnostics (K&R B.6) ----------------------------------------------------
 */

/*
 *	Not imported - assert(n) is a macro defined in <assert.h>
 */

/*
 *	End of diagnostic functions ----------------------------------------------
 */

/*
 *	Variable argument lists (K&R B.7) ----------------------------------------
 */

/*
 *	Not imported - no functions to import
 */

/*
 *	End of variable argument functions ---------------------------------------
 */

/*
 *	Non-local jumps (K&R B.8) ------------------------------------------------
 */

#if IMPORT_JUMP_FUNCS

/*
 *  This routine must be implemented on this side of the API as it can't be
 *  passed through to the other side
 *
int setjmp(jmp_buf env)
{ return(API_Exports->Export_setjmp(env));}
 */

void longjmp(jmp_buf env,int val)
{ API_Exports->Export_longjmp(env,val);}

#endif

/*
 *	End non-local jump functions ---------------------------------------------
 */

/*
 *	Signal functions (K&R B.9) -----------------------------------------------
 */

#if IMPORT_SIGNAL_FUNCS

void (*signal(int sig,void (*handler)(int)))(int)
{ return(API_Exports->Export_signal(sig,handler));}

int raise(int sig)
{ return(API_Exports->Export_raise(sig));}

#endif

/*
 *	End signal functions -----------------------------------------------------
 */

/*
 *	Date and time functions (K&R B.10) ---------------------------------------
 */

#if IMPORT_TIME_FUNCS

clock_t clock(void)
{ return(API_Exports->Export_clock());}

time_t time(time_t *exp)
{ return(API_Exports->Export_time(exp));}

#undef difftime

double difftime(time_t time2, time_t time1)
{
	SS_DBL	d = API_Exports->Export_difftime(time2,time1);
	return(GET_SS_DBL(d));
}

time_t mktime(struct tm *tp)
{ return(API_Exports->Export_mktime(tp));}

char *asctime(const struct tm *tp)
{ return(API_Exports->Export_asctime(tp));}

char *ctime(const time_t *tp)
{ return(API_Exports->Export_ctime(tp));}

struct tm *gmtime(const time_t *tp)
{ return(API_Exports->Export_gmtime(tp));}

size_t strftime(char *s,size_t smax,const char *fmt,const struct tm *tp)
{ return(API_Exports->Export_strftime(s,smax,fmt,tp));}


#endif

/*
 *	End date and time functions -----------------------------------------------
 */

/*
 *	Limits (K&R B.11) ---------------------------------------------------------
 */

/*
 *	Not imported - these are macros in <limits.h> and <float.h>
 */

/*
 *	End limits ----------------------------------------------------------------
 */

#endif	// !USE_STD_CRT


/*
 * 	Wrapper functions for calling via the API Vector Table
 */

void	Init(T_WORLDCHUNK *Root,T_SHAPECHUNK *Shape)
			{API_Vectors->_Init(Root,Shape);}
void 	InitSCL(T_WORLDCHUNK *SCL)
			{API_Vectors->_InitSCL(SCL);}
void 	InitViewPoints(T_WORLDCHUNK *p)
			{API_Vectors->_InitViewPoints(p);}

void 	Process(T_WORLDCHUNK *Tree)
			{API_Vectors->_Process(Tree);}
void 	MatMult(T_MATRIX m1,T_MATRIX m2, T_MATRIX Result)
			{API_Vectors->_MatMult(m1,m2,Result);}
void 	MatMake(short XRot, short YRot, short ZRot, T_MATRIX Result)
			{API_Vectors->_MatMake(XRot,YRot,ZRot,Result);}
void 	MatMakeInv(short XRot, short YRot, short ZRot, T_MATRIX Result)
			{API_Vectors->_MatMakeInv(XRot,YRot,ZRot,Result);}
void 	RotatePoint(T_POINTREC3D *Point, T_MATRIX Matrix, short Type)
			{API_Vectors->_RotatePoint(Point,Matrix,Type);}
void 	RotatePointLong(T_LONGVECTOR *Point,T_MATRIX Matrix, short Type)
			{API_Vectors->_RotatePointLong(Point,Matrix,Type);}

T_DCOBJECT *SortTree(void)
		{return(API_Vectors->_SortTree());}

void	Draw(void *Tree)
			{API_Vectors->_Draw(Tree);}
void 	ClearScreen(void)
			{API_Vectors->_ClearScreen();}
void 	ClearWindow(void)
			{API_Vectors->_ClearWindow();}
void 	ScreenDraw(void)
			{API_Vectors->_ScreenDraw();}
void 	DrawPolygon(T_GRPOLYGON *Polygon)
			{API_Vectors->_DrawPolygon(Polygon);}
void 	DrawRectangle(short x1,short y1,short x2,short y2,unsigned char Colour)
			{API_Vectors->_DrawRectangle(x1,y1,x2,y2,Colour);}
void	Horizon(void)
			{API_Vectors->_Horizon();}
void 	DrawInstruments(short WindowNumber)
			{API_Vectors->_DrawInstruments(WindowNumber);}
void 	Text(short x,short y,unsigned char FGColour,
			 unsigned char BGColour,short FontID, short MaxLen,
			 short Align, unsigned char Flags,char *String)
			{API_Vectors->_Text(x,y,FGColour,BGColour,FontID,MaxLen,Align,Flags,String);}

void 	UpdateWorld(T_WORLDCHUNK *Tree)
			{API_Vectors->_UpdateWorld(Tree);}
void 	UpdateViewPoint(void)
			{API_Vectors->_UpdateViewPoint();}

void 	ExecuteSCL(T_WORLDCHUNK *Tree)
			{API_Vectors->_ExecuteSCL(Tree);}
short	Execute(unsigned char *Conditions)
			{return(API_Vectors->_Execute(Conditions));}
void 	PushN(short t, long v)
			{API_Vectors->_PushN(t,v);}
void 	PushF(short t, float v)
			{API_Vectors->_PushF(t,v);}
void 	PushP(short t, void *v)
			{API_Vectors->_PushP(t,v);}
long 	PopN(short t)
			{return(API_Vectors->_PopN(t));}
float 	PopF(short t)
			{return(API_Vectors->_PopF(t));}

long 	BLoad(char *FileName,void *LoadAddress,long MaxLength)
			{return(API_Vectors->_BLoad(FileName,LoadAddress,MaxLength));}
long 	BSave(char *FileName,void *SaveAddress,long Length)
			{return(API_Vectors->_BSave(FileName,SaveAddress,Length));}
long 	GetFileLength(char *FileName)
			{return(API_Vectors->_GetFileLength(FileName));}
char **	GetFileList(char *PathName, char *Buffer, short BufLen)
			{return(API_Vectors->_GetFileList(PathName,Buffer,BufLen));}
char *	FileSelector(char *Path,char *FileName,char *Title,long FileTypes)
			{return(API_Vectors->_FileSelector(Path,FileName,Title,FileTypes));}
void 	SplitPath(char *FileName,char *Path,char *File)
			{API_Vectors->_SplitPath(FileName,Path,File);}
long 	LoadSS(char *FileName,char *LoadAddress,long MaxLength,
			   char *Type,char Mode)
			{return(API_Vectors->_LoadSS(FileName,LoadAddress,MaxLength,Type,Mode));}
long 	SaveSS(char *FileName,char *SaveAddress,long Length,
			   char *Type,char Mode)
			{return(API_Vectors->_SaveSS(FileName,SaveAddress,Length,Type,Mode));}
long 	SaveVRT(char *FileName,short Flags,char Mode)
			{return(API_Vectors->_SaveVRT(FileName,Flags,Mode));}
long 	GetLenSS(char *FileName,char *Type,char Mode)
			{return(API_Vectors->_GetLenSS(FileName,Type,Mode));}
char *	GetFileName(char *FileName,char *Type)
			{return(API_Vectors->_GetFileName(FileName,Type));}

char *	LongToDec(long n,char *String,short Length)
			{return(API_Vectors->_LongToDec(n,String,Length));}
char *	LongToHex(long n,char *String,short Length)
			{return(API_Vectors->_LongToHex(n,String,Length));}
char *	LongToBin(long n,char *String,short Length)
			{return(API_Vectors->_LongToBin(n,String,Length));}
char *	AscToLong(long *n,char *String,short Base,char MaxChar)
			{return(API_Vectors->_AscToLong(n,String,Base,MaxChar));}
char *	DecToLong(long *n,char *String)
			{return(API_Vectors->_DecToLong(n,String));}
char *	HexToLong(long *n,char *String)
			{return(API_Vectors->_HexToLong(n,String));}
char *	BinToLong(long *n,char *String)
			{return(API_Vectors->_BinToLong(n,String));}
char *	EnumToAsc(long n,char *String,short Length,char *EnumString)
			{return(API_Vectors->_EnumToAsc(n,String,Length,EnumString));}

long 	Random(long Seed)
			{return(API_Vectors->_Random(Seed));}
short 	ArcSin(short Value)
			{return(API_Vectors->_ArcSin(Value));}
short 	ArcCos(short Value)
			{return(API_Vectors->_ArcCos(Value));}
short 	ArcTan(long Num,long Denom)
			{return(API_Vectors->_ArcTan(Num,Denom));}

void 	FindFacet(short pX, short pY, T_OBJFAC *pObjFac,unsigned short Exclude)
			{API_Vectors->_FindFacet(pX,pY,pObjFac,Exclude);}
void 	AbsPosition(long *x,long *y,long*z,short Object,char Lock,
					short *xr,short *yr,short *zr)
			{API_Vectors->_AbsPosition(x,y,z,Object,Lock,xr,yr,zr);}
short 	FindBearing(long x,long y,long z,short *XRot)
			{return(API_Vectors->_FindBearing(x,y,z,XRot));}
void 	FindOffset(short Object, short PointNum, long *x,long *y,long *z)
			{API_Vectors->_FindOffset(Object,PointNum,x,y,z);}
void 	SetViewpoint(short VPNum)
			{API_Vectors->_SetViewpoint(VPNum);}

T_PICKITEM *Pick(char *Title,T_PICKITEM *PickList,short Mode, T_PICKITEM * (*FilterFunction)(T_PICKITEM *))
			{return(API_Vectors->_Pick(Title,PickList,Mode,FilterFunction));}
short 	SaveScreen(short Format)
			{return(API_Vectors->_SaveScreen(Format));}

/*
 * 	EditLine and EditScreen are no longer available.
 */

unsigned short EditLine(T_GRTEXT *Text,short CursPos,short MaxLen,char Flag)
			{Text=Text;CursPos=CursPos;MaxLen=MaxLen;Flag=Flag;return((unsigned short)E_ERROR);}
unsigned short EditScreen(T_GRTEXT *Text,long CursPos,long MaxLen,
				  		  short MaxWidth, short ScrnHeight)
			{Text=Text;CursPos=CursPos;MaxLen=MaxLen;MaxWidth=MaxWidth;
			 ScrnHeight=ScrnHeight;return((unsigned short)E_ERROR);}

void	*FindDial(char *DialName)
			{return(API_Vectors->_FindDial(DialName));}
void 	DrawPropMenu(char *DialName)
			{API_Vectors->_DrawPropMenu(DialName);}
long 	Dialogue(char *DialName)
			{return(API_Vectors->_Dialogue(DialName));}
long	Alert(char *String, short Type, short Buttons)
			{return(API_Vectors->_Alert(String,Type,Buttons));}
long 	PopUpDialogue(char *DialName)
			{return(API_Vectors->_PopUpDialogue(DialName));}
long 	CentreDialogue(char *DialName)
			{return(API_Vectors->_CentreDialogue(DialName));}
void 	FillInShortCuts(char *DialName)
			{API_Vectors->_FillInShortCuts(DialName);}
void 	UpdateDialogue(char *DialName, short Item, short MaxKids)
			{API_Vectors->_UpdateDialogue(DialName,Item,MaxKids);}

short 	Compile(char *String,unsigned char *SCL,T_OBJSYM *Comment,
	  			T_OBJSYM *VarName)
			{return(API_Vectors->_Compile(String,SCL,Comment,VarName));}
short 	Decompile(unsigned char *SCL,char *Text,char *EndText,
	  			  T_OBJSYM *Comment, T_OBJSYM *VarName)
			{return(API_Vectors->_Decompile(SCL,Text,EndText,Comment,VarName));}

short 	ReInsert(char  *Ptr, long Length, long PrevLength,
			     char  *End, char *Buffer, long BufUsed)
			{return(API_Vectors->_ReInsert(Ptr,Length,PrevLength,End,Buffer,BufUsed));}
void 	GetFunctions(void)
			{API_Vectors->_GetFunctions();}
void 	WriteFunc(long Function,short Param)
			{API_Vectors->_WriteFunc(Function,Param);}

long 	ProcessFunctions(void(*Func)(long))
			{return(API_Vectors->_ProcessFunctions(Func));}
void 	ObeyFunction(long FuncNum)
			{API_Vectors->_ObeyFunction(FuncNum);}

void 	MouseOn(void)
			{API_Vectors->_MouseOn();}
void 	MouseOff(void)
			{API_Vectors->_MouseOff();}

void 	_Terminate(short ErrorCode)
			{API_Vectors->_Terminate(ErrorCode);}

// New faster macro ChunkAdd2 in APP_DEFS.H
T_WORLDCHUNK * ChunkAdd(short Object,unsigned short ChkType)
			{return(API_Vectors->_ChunkAdd(Object,ChkType));}

short 	RegisterSCL(T_COMPILEREC *CRec,void __vrtcall (*Function)(void))
			{return(API_Vectors->_RegisterSCL(CRec,Function));}
short 	UnRegisterSCL(short OpCode)
			{return(API_Vectors->_UnRegisterSCL(OpCode));}

void *	PopP(short t)
			{return(API_Vectors->_PopP(t));}

short 	ResizeScreen(char Resolution)
			{return(API_Vectors->_ResizeScreen(Resolution));}
void 	VisError(char *String)
			{API_Vectors->_VisError(String);}

void 	AddDrawChunk(short Type,void *Data,short Length,char Flush,short Buffer)
			{API_Vectors->_AddDrawChunk(Type,Data,Length,Flush,Buffer);}
void 	AddRectangle(short x1,short y1,short x2,short y2,
				 	 unsigned char Colour,unsigned char Type)
			{API_Vectors->_AddRectangle(x1,y1,x2,y2,Colour,Type);}
void 	AddText(short x,short y,unsigned char FGColour,
		 	    unsigned char BGColour,short FontID,
				short MaxLen,short Align,unsigned char Flags,
				char *String)
			{API_Vectors->_AddText(x,y,FGColour,BGColour,FontID,MaxLen,Align,Flags,String);}

char *	LongToAsc(long n,char *String,short Length,long *Power,
				  short NumPowers)
			{return(API_Vectors->_LongToAsc(n,String,Length,Power,NumPowers));}

long 	SquareRoot(long n)
			{return(API_Vectors->_SquareRoot(n));}

long 	SaveWorld(void)
			{return(API_Vectors->_SaveWorld());}
long 	LoadWorld(void)
			{return(API_Vectors->_LoadWorld());}
long 	ClearWorld(void)
			{return(API_Vectors->_ClearWorld());}
long 	SaveShape(void)
			{return(API_Vectors->_SaveShape());}
long 	LoadShape(void)
			{return(API_Vectors->_LoadShape());}
long 	ClearShape(void)
			{return(API_Vectors->_ClearShape());}
long 	SavePalette(void)
			{return(API_Vectors->_SavePalette());}
long 	LoadPalette(void)
			{return(API_Vectors->_LoadPalette());}
long 	ClearPalette(void)
			{return(API_Vectors->_ClearPalette());}
long 	SaveUserSprites(void)
			{return(API_Vectors->_SaveUserSprites());}
long 	LoadUserSprites(void)
			{return(API_Vectors->_LoadUserSprites());}
long 	ClearUserSprites(void)
			{return(API_Vectors->_ClearUserSprites());}
long 	SaveUserRsrc(void)
			{return(API_Vectors->_SaveUserRsrc());}
long 	LoadUserRsrc(void)
			{return(API_Vectors->_LoadUserRsrc());}
long 	ClearUserRsrc(void)
			{return(API_Vectors->_ClearUserRsrc());}
long 	SaveMessages(void)
			{return(API_Vectors->_SaveMessages());}
long 	LoadMessages(void)
			{return(API_Vectors->_LoadMessages());}
long 	ClearMessages(void)
			{return(API_Vectors->_ClearMessages());}
long 	SaveSounds(void)
			{return(API_Vectors->_SaveSounds());}
long 	LoadSounds(void)
			{return(API_Vectors->_LoadSounds());}
long 	ClearSounds(void)
			{return(API_Vectors->_ClearSounds());}
long 	LoadBackdrop(short Number)
			{return(API_Vectors->_LoadBackdrop(Number));}
long 	SaveConfig(void)
			{return(API_Vectors->_SaveConfig());}
long 	SavePrefs(void)
			{return(API_Vectors->_SavePrefs());}

void 	PrintScreen(void)
			{API_Vectors->_PrintScreen();}
void 	ChoosePrinter(void)
			{API_Vectors->_ChoosePrinter();}

T_OBJSYM *GetSym(short ObjNum,short Chk)
			{return(API_Vectors->_GetSym(ObjNum,Chk));}
T_OBJSYM *GetShapeSym(short ShpNum,short Chk)
			{return(API_Vectors->_GetShapeSym(ShpNum,Chk));}
T_OBJSYM *GetSymList(short Number,short Chk,T_OBJSYM *s)
			{return(API_Vectors->_GetSymList(Number,Chk,s));}

short 	GetSCLLength(unsigned char *SCL)
			{return(API_Vectors->_GetSCLLength(SCL));}

void 	FlushUndoBuf(void)
			{API_Vectors->_FlushUndoBuf();}

void 	CheckRepeat(long Function,short Param)
			{API_Vectors->_CheckRepeat(Function,Param);}

short 	RegisterDev(T_STDFUNCPTR *Functions,short Type)
			{return(API_Vectors->_RegisterDev(Functions,Type));}

short 	ReRegisterDev(T_STDFUNCPTR *Functions,short Type,short Slot)
			{return(API_Vectors->_ReRegisterDev(Functions,Type,Slot));}

short 	RegisterDevFunc(T_STDFUNCPTR Function,short Type,short Slot,short EntryNum)
			{return(API_Vectors->_RegisterDevFunc(Function,Type,Slot,EntryNum));}

short 	CreateVRTPalette(char *pBuffer,short PalNum)
			{return(API_Vectors->_CreateVRTPalette(pBuffer,PalNum));}
short 	DeleteVRTPalette(short PalNum)
			{return(API_Vectors->_DeleteVRTPalette(PalNum));}
short 	CreateVRTObject(char *pBuffer,char *pName,short ObjNum)
			{return(API_Vectors->_CreateVRTObject(pBuffer,pName,ObjNum));}
short 	DeleteVRTObject(short ObjNum)
			{return(API_Vectors->_DeleteVRTObject(ObjNum));}
short 	CreateVRTShape(char *pBuffer,char *pName,short ShpNum)
			{return(API_Vectors->_CreateVRTShape(pBuffer,pName,ShpNum));}
short 	DeleteVRTShape(short ShpNum)
			{return(API_Vectors->_DeleteVRTShape(ShpNum));}
short 	CreateVRTWindow(T_CONSOLE *pBuffer,short WinNum)
			{return(API_Vectors->_CreateVRTWindow((char *)pBuffer,WinNum));}
short 	DeleteVRTWindow(short WinNum)
			{return(API_Vectors->_DeleteVRTWindow(WinNum));}
short 	CreateVRTInstrument(T_INSTRUMENT *pBuffer,short Console,short InstNum)
			{return(API_Vectors->_CreateVRTInstrument((char *)pBuffer,Console,InstNum));}
short 	DeleteVRTInstrument(short Console,short InstNum)
			{return(API_Vectors->_DeleteVRTInstrument(Console,InstNum));}
short 	CreateVRTIcon(T_ICON *pBuffer,short IconTable,short IconNum)
			{return(API_Vectors->_CreateVRTIcon((char *)pBuffer,IconTable,IconNum));}
short 	DeleteVRTIcon(short IconTable,short IconNum)
			{return(API_Vectors->_DeleteVRTIcon(IconTable,IconNum));}
short 	CreateVRTSprite(T_GRSPRINST *pBuffer,char *pName,short SprNum)
			{return(API_Vectors->_CreateVRTSprite((char *)pBuffer,pName,SprNum));}
short 	CreateVRTSpriteWithPalette(T_GRSPRINST *pBuffer,char *pName,short SprNum,unsigned char *pPal)
			{return(API_Vectors->_CreateVRTSpriteWithPalette((char *)pBuffer,pName,SprNum,pPal));}
short 	DeleteVRTSprite(short SprNum)
			{return(API_Vectors->_DeleteVRTSprite(SprNum));}
int		RemoveSpriteColour(unsigned int Colour,int SprNum,int bUseFirst16)
			{return(API_Vectors->_RemoveSpriteColour(Colour,SprNum,bUseFirst16));}
short 	CreateVRTDial(char *pBuffer,char *pName)
			{return(API_Vectors->_CreateVRTDial(pBuffer,pName));}
short 	DeleteVRTDial(char *pName)
			{return(API_Vectors->_DeleteVRTDial(pName));}
short 	CreateVRTSound(T_SOUNDREC *pBuffer,char *pName,short SndNum)
			{return(API_Vectors->_CreateVRTSound((char *)pBuffer,pName,SndNum));}
short 	DeleteVRTSound(short SndNum)
			{return(API_Vectors->_DeleteVRTSound(SndNum));}

T_DOSVECTOR GetDosVector(short VecNum)
			{return(API_Vectors->_GetDosVector(VecNum));}
void	SetDosVector(short VecNum,T_DOSVECTOR FuncPtr)
			{API_Vectors->_SetDosVector(VecNum,FuncPtr);}

short 	RegisterShare(T_APISHARE *ShareInfo)
			{return(API_Vectors->_RegisterShare(*(API_Vectors->_C_DllNumber),ShareInfo));}
T_APISHARE *GetShare(char *Name)
			{return(API_Vectors->_GetShare(Name));}

short 	ImageLoadLibrary(void)
{
	short nRetVal;
#ifdef _MSC_VER
	_asm push ebx
#endif
	nRetVal = API_Vectors->_ImageLoadLibrary();	
#ifdef _MSC_VER
	_asm pop ebx
#endif
	return(nRetVal);
}

short	FFT(float *Real, float *Imag, long Pwr, short Dir)
			{return(API_Vectors->_FFT(Real,Imag,Pwr,Dir));}

long	Conv_Element(T_ELEMENT *pElement)
			{return(API_Vectors->_Conv_Element(pElement));}
short	Conv_CheckBreak(void)
			{return(API_Vectors->_Conv_CheckBreak());}
void	Conv_Fatal(char *Error)
			{API_Vectors->_Conv_Fatal(Error);}
void	Conv_ShowProgress(void)
			{API_Vectors->_Conv_ShowProgress();}
void 	Conv_UpdateProgress(void)
			{API_Vectors->_Conv_UpdateProgress();}
void	Conv_HideProgress(void)
			{API_Vectors->_Conv_HideProgress();}
void 	Conv_CleanUpElement(void)
			{API_Vectors->_Conv_CleanUpElement();}
void 	Conv_InitElement(void)
			{API_Vectors->_Conv_InitElement();}
void *	Conv_ElementAllocMem(size_t size, long Length)
			{return(API_Vectors->_Conv_ElementAllocMem(size, Length));}
void *	Conv_ElementReallocMem(void *p, size_t size)
			{return(API_Vectors->_Conv_ElementReallocMem(p, size));}
T_ELEMENT *Conv_FindElement(char *Name)
			{return(API_Vectors->_Conv_FindElement(Name));}
T_STANDARD *Conv_MakeWorldObject(T_ELEMENT *Element, long MyParent, long PrevSib, T_ELEMENT *ParElement)
			{return(API_Vectors->_Conv_MakeWorldObject(Element, MyParent, PrevSib, ParElement));}
void	Conv_ElementDeallocMem(void *p)
			{API_Vectors->_Conv_ElementDeallocMem(p);}
void	Conv_Message(char *Message)
			{API_Vectors->_Conv_Message(Message);}
long	Conv_RemapColour(unsigned char r, unsigned char g, unsigned char b, unsigned char a)
			{return(API_Vectors->_Conv_RemapColour(r,g,b,a));}
T_CNVFACET * Conv_NewFacet(short NumPoints)
			{return(API_Vectors->_Conv_NewFacet(NumPoints));}
void	Conv_RemoveFacet(long FacetNo)
			{API_Vectors->_Conv_RemoveFacet(FacetNo);}
T_CNVLAYER * Conv_NewLayer(void)
			{return(API_Vectors->_Conv_NewLayer());}
void	Conv_RemoveLayer(long LayerNo)
			{API_Vectors->_Conv_RemoveLayer(LayerNo);}
T_ELEMENT *Conv_NewElement(void)
			{return(API_Vectors->_Conv_NewElement());}
void	Conv_RemoveElement(char *ElementName)
			{API_Vectors->_Conv_RemoveElement(ElementName);}
T_CHILD *Conv_NewChild(char *ElementName)
			{return(API_Vectors->_Conv_NewChild(ElementName));}
void	Conv_RemoveChild(char *ElementName, long ChildNo)
			{API_Vectors->_Conv_RemoveChild(ElementName, ChildNo);}

void *	CreateTextBlock(char *Title,char *Text,long MaxLen,unsigned short Flags)
			{return(API_Vectors->_CreateTextBlock(Title,Text,MaxLen,Flags));}
long	EditTextBlock(void* Handle)
			{return(API_Vectors->_EditTextBlock(Handle));}
void	SetTextBlockCursor(void *Handle,long CursorPos,long BlockStart,long BlockEnd)
			{API_Vectors->_SetTextBlockCursor(Handle,CursorPos,BlockStart,BlockEnd);}
void	SetTextBlockErrorStrings(void *Handle,char *ErrorString1,char *ErrorString2,char *ErrorString3)
			{API_Vectors->_SetTextBlockErrorStrings(Handle,ErrorString1,ErrorString2,ErrorString3);}
void	DestroyTextBlock(void *Handle)
			{API_Vectors->_DestroyTextBlock(Handle);}

short	CloseDialogue(char *DialName)
			{return(API_Vectors->_CloseDialogue(DialName));}

/*
 * 	Wrappers for vector elements in API_Old_Vectors ------------------------
 */

void	OldUnknownFunction(long FuncNum)
			{API_Old_Vectors._UnknownFunction(FuncNum);}
void	OldUnknownInstr(T_INSTRUMENT *Ins)
			{API_Old_Vectors._UnknownInstr(Ins);}
void	OldUnknownDialItem(void *DialItem)
			{API_Old_Vectors._UnknownDialItem(DialItem);}
void 	OldUnknownWChunk(T_WORLDCHUNK *Chunk)
			{API_Old_Vectors._UnknownWChunk(Chunk);}
void 	OldUnknownSChunk(T_SHAPECHUNK *Chunk)
			{API_Old_Vectors._UnknownSChunk(Chunk);}

void 	OldVecB4Init(void)
			{API_Old_Vectors._VecB4Init();}
void 	OldVecAFInit(void)
			{API_Old_Vectors._VecAFInit();}
void 	OldVecVisEntry(void)
			{API_Old_Vectors._VecVisEntry();}
void 	OldVecB4GetFunc(void)
			{API_Old_Vectors._VecB4GetFunc();}
void	OldVecAFGetFunc(void)
			{API_Old_Vectors._VecAFGetFunc();}
void	OldVecB4DoFunc(void)
			{API_Old_Vectors._VecB4DoFunc();}
void 	OldVecAFDoFunc(void)
			{API_Old_Vectors._VecAFDoFunc();}
void 	OldVecB4Update(void)
			{API_Old_Vectors._VecB4Update();}
void 	OldVecB4SCL(void)
			{API_Old_Vectors._VecB4SCL();}
void 	OldVecB4Render(void)
			{API_Old_Vectors._VecB4Render();}
void 	OldVecB4Process(void)
			{API_Old_Vectors._VecB4Process();}
void 	OldVecB4Sort(void)
			{API_Old_Vectors._VecB4Sort();}
void 	OldVecB4Instrs(void)
			{API_Old_Vectors._VecB4Instrs();}
void 	OldVecB4ScreenSwap(void)
			{API_Old_Vectors._VecB4ScreenSwap();}
void 	OldVecB4Draw(void)
			{API_Old_Vectors._VecB4Draw();}
void 	OldVecAFDraw(void)
			{API_Old_Vectors._VecAFDraw();}
void 	OldVecAFRender(void)
			{API_Old_Vectors._VecAFRender();}
void 	OldVecVisExit(void)
			{API_Old_Vectors._VecVisExit();}

T_ENTITY * GetEntityFromObject(short nObject)
			{return API_Old_Vectors._GetEntityFromObject(nObject);}

void	RelPosition(long *x,long *y,long *z,short Object)
			{API_Vectors->_RelPosition(x,y,z,Object);}
void	RelRotation(short *XR,short *YR,short *ZR,short Object)
			{API_Vectors->_RelRotation(XR,YR,ZR,Object);}
void	Orientation(short obj,short *XR,short *YR,short *ZR)
			{API_Vectors->_Orientation(obj,XR,YR,ZR);}

/*
 * Additional defines etc. for WATCOM C/C++ --------------------------------
 */

#ifdef __WATCOMC__

#ifndef USE_STD_CRT
	void __GETDS(void)
	{ __vrtgetds_f(); }

	void __CHP(void)
	{ __vrtchp(); }
#endif	// !USE_STD_CRT

#endif

/*----------------------------------------------------------------------------
 */
