#!/usr/bin/env python3
"""Post-edit all Arabic pages while preserving URLs and behavior."""
from __future__ import annotations
import json,re,sys
from pathlib import Path
from lxml import html
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/"tools"))
import polish_arabic_new_pages as base
from build_arabic_product_pages import TERM_FIXES
EXTRA=[("Food Grade","درجة غذائية"),("Feed Grade","درجة علفية"),("Standard packing","التعبئة القياسية"),("Container loading","تحميل الحاوية"),("Please email info@bespringchem.com.","يرجى مراسلتنا على info@bespringchem.com."),("Thank you. Your request has been sent.","شكراً، تم إرسال طلبك."),("Request a Quote","طلب عرض سعر"),("Contact Sales","التواصل مع المبيعات"),("Safety Data Sheet","نشرة بيانات السلامة (SDS)"),("Technical Data Sheet","ورقة البيانات الفنية (TDS)"),("bulk quotation","عرض سعر للكميات التجارية"),("bulk price","سعر الجملة")]
def polish(v):
 v=base.polish(v)
 for a,b in TERM_FIXES+EXTRA:v=v.replace(a,b)
 return v
def pj(v,d,h):
 if isinstance(v,dict):
  r={k:pj(x,d,h) for k,x in v.items()};t=r.get("@type")
  if t=="WebPage" and "inLanguage" in r:r["inLanguage"]="ar"
  if isinstance(t,str) and t in {"WebPage","Product","Service"} and isinstance(r.get("description"),str) and re.search(r"\b(Source|Supplier|Food Grade)\b",r["description"]):r["description"]=d
  return r
 if isinstance(v,list):return[pj(x,d,h) for x in v]
 if isinstance(v,str) and not v.startswith(("http://","https://")):return polish(v)
 return v
def main():
 changed=0
 for path in sorted((ROOT/"ar").rglob("*.html")):
  raw=path.read_text(encoding="utf-8");doc=html.fromstring(raw);doc.set("dir","rtl");h=doc.xpath("string(//h1)").strip();d=doc.xpath("string(//meta[@name='description']/@content)").strip()
  for n in doc.iter():
   if not isinstance(n.tag,str) or n.tag.lower() in {"script","style","code","pre"}:continue
   if n.text:n.text=polish(n.text)
   if n.tail:n.tail=polish(n.tail)
   for a in ("alt","title","aria-label","placeholder"):
    if n.get(a):n.set(a,polish(n.get(a)))
   if n.tag.lower()=="meta" and n.get("content"):n.set("content",polish(n.get("content")))
  for s in doc.xpath("//script[@type='application/ld+json']"):
   try:data=json.loads(s.text or "")
   except json.JSONDecodeError:continue
   s.text=json.dumps(pj(data,d,h),ensure_ascii=False,separators=(",",":"))
  if h and "/products/" in path.as_posix():
   for f in doc.xpath("//form//*[@name='product']"):f.set("value",h)
  out=html.tostring(doc,encoding="unicode",method="html",doctype="<!DOCTYPE html>")
  repl={"Thank you. Your request has been received and our team will contact you shortly.":"شكراً، استلمنا طلبك وسيتواصل معك فريقنا قريباً.","We could not send your request. Please email info@bespringchem.com or try again.":"تعذر إرسال الطلب. راسلنا على info@bespringchem.com أو حاول مرة أخرى.","Please email info@bespringchem.com.":"يرجى مراسلتنا على info@bespringchem.com.","Thank you. Your request has been sent.":"شكراً، تم إرسال طلبك.","Close navigation menu":"إغلاق قائمة التنقل","Open navigation menu":"فتح قائمة التنقل","The form service is temporarily unavailable.":"خدمة النموذج غير متاحة مؤقتاً.","Sending your request...":"جارٍ إرسال طلبك...","Sending your request…":"جارٍ إرسال طلبك…","The form could not be sent. Please email info@bespringchem.com or try again.":"تعذر إرسال النموذج. راسلنا على info@bespringchem.com أو حاول مرة أخرى."}
  for a,b in repl.items():out=out.replace(a,b)
  out=re.sub(r"Thank you\. Your [^.\"']+ (?:quote request|request|inquiry) has been sent(?: successfully)?\.","شكراً، تم إرسال طلبك بنجاح.",out)
  if out!=raw:path.write_text(out,encoding="utf-8",newline="");changed+=1
 print(f"Post-edited {changed} Arabic pages; RTL and URLs preserved.")
if __name__=="__main__":main()
