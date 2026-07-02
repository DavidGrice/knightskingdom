#!/usr/bin/env python3
"""
scl_decompile.py -- disassembler for compiled SCL (chunk 0x06) in
LEGO Creator: Knights' Kingdom. Uses scl_grammar.tokenize (corpus-
validated: 100%% of 747 chunks tokenise end-to-end; ~84%% of bytes map
to named tokens, the rest being operand tails and pad). Emits a
stack-machine listing with builtin calls, property() idioms, string
literals, variables, constants, and branch targets resolved.

Usage: python3 scl_decompile.py [--summary] [--obj N] <files.lca...>
"""
import os, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lca_parser as L
from scl_grammar import tokenize, OPS

def scan(path):
    d=open(path,"rb").read(); _h,subs=L.split_container(d)
    if "WRLD" not in subs: return []
    wld=subs["WRLD"]; o=12; cur=None; out=[]
    while o+4<=len(wld):
        t=struct.unpack_from("<H",wld,o)[0]
        if t==0xFFFF:
            o+=2
            if o+2<=len(wld) and struct.unpack_from("<H",wld,o)[0]==0xFFFF: break
            continue
        ln=struct.unpack_from("<H",wld,o+2)[0]
        if ln<4 or o+ln>len(wld): break
        if t==0 and ln>=0x44: cur=struct.unpack_from("<H",wld,o+6)[0]
        elif t==6: out.append((cur,wld[o+4:o+ln]))
        o+=ln
    return out

def listing(b):
    lines=[]; stack=[]
    for off,kind,val in tokenize(b):
        if kind=="str": stack.append(f'"{val}"')
        elif kind=="const": stack.append(str(val))
        elif kind=="lvar": stack.append(f"L{val}")
        elif kind=="var": stack.append(f"V{val}")
        elif kind=="wvar": stack.append(f"W{val}")
        elif kind=="deref": pass
        elif kind=="call":
            if val=="property" and stack:
                stack.append(f"property({stack.pop()})")
            elif val in ("sound","soundq") and stack:
                lines.append(f"{val}({stack.pop()})")
            else:
                a=", ".join(stack[-3:]); stack[:]=stack[:-3]
                lines.append(f"{val}({a})")
        elif kind in ("brz","brnz"):
            c=stack.pop() if stack else "?"
            lines.append(f"if {'!' if kind=='brz' else ''}({c}) goto +{val}")
        elif kind=="op":
            if val in ("eq","pluseq","minuseq","andeq","oreq") and len(stack)>=2:
                x=stack.pop(); y=stack.pop(); lines.append(f"{y} {val} {x}")
            elif val in ("waitf","waitfs","vis","invis","kill","random","change","activate","togvis","settrig"):
                lines.append(f"{val} {stack.pop() if stack else ''}".rstrip())
            elif val in ("plus","minus","multiply","slash","mod","eqeq","noteq","less","great","lesseq","greateq","and","or","andand","oror") and len(stack)>=2:
                x=stack.pop(); y=stack.pop(); stack.append(f"({y} {val} {x})")
            else: stack.append(val)
    if stack: lines.append("; ".join(stack))
    return lines

def main():
    a=sys.argv[1:]; only=None; summ="--summary" in a
    if summ: a.remove("--summary")
    if "--obj" in a:
        k=a.index("--obj"); only=int(a[k+1]); a=a[:k]+a[k+2:]
    for path in a:
        base=os.path.basename(path)
        for num,body in scan(path):
            if only is not None and num!=only: continue
            toks=tokenize(body); raw=sum(1 for _,k,_ in toks if k=="raw")
            if summ:
                calls=sorted({v for _,k,v in toks if k=="call"})
                strs=[v for _,k,v in toks if k=="str"]
                print(f"{base} obj {num}: {len(body)}B calls[{len(calls)}]={', '.join(calls[:12])}")
            else:
                print(f"\n=== {base} obj {num} ({len(body)}B, {raw} raw) ===")
                for ln in listing(body): print("   "+ln)

if __name__=="__main__": main()
