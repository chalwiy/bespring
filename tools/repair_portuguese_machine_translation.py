#!/usr/bin/env python3
"""Repair Brazilian Portuguese localization defects without changing URLs."""
from pathlib import Path
import re, html as html_std

ROOT=Path(__file__).resolve().parents[1]
GLOBAL={
"Entre em contato com a equipe comercials":"Solicite à equipe comercial",
"Pedido de especificação e citação":"Solicitar especificação e cotação",
"especificação privada atual":"especificação vigente acordada",
"especificações privadas atuais":"especificações vigentes acordadas",
"especificações privadas actuais":"especificações vigentes acordadas",
"especificação privada":"especificação acordada",
"Documentação técnica privada":"Documentação técnica",
"fonte específica":"fornecedor específico",
"específica da fonte":"específica do fornecedor",
"Contacte as vendas para":"Solicite à equipe comercial",
"Contate as vendas para":"Solicite à equipe comercial",
"Instruções de origem":"Orientações do fabricante",
"procedimentos de manuseio treinados":"procedimentos de manuseio executados por pessoal treinado",
"Documentos dos produtos":"Documentação do produto",
"COA representativo e lote":"COA representativo e COA do lote",
"Representante e lote COA":"COA representativo e COA do lote",
"Contate a equipe de vendas":"Entre em contato com a equipe comercial",
"Discuta uma especificação acordada":"Solicite a especificação vigente e discuta",
"Discuta uma especificação privada":"Solicite a especificação vigente e discuta",
"Serviços de fornecimento":"Serviços de abastecimento",
"Reveja o fornecimento e o apoio à exportação":"Conheça o suporte de abastecimento e exportação",
"Pedido de especificação e cotação":"Solicitar especificação e cotação",
"formulário":"forma",
"Formulário":"Forma",
"requisitos de mercado de destino":"requisitos do mercado-alvo",
"requisitos do mercado de destino":"requisitos do mercado-alvo",
"requisitos de destino-mercado":"requisitos do mercado-alvo",
"planta de culturas e solos":"plano de cultivo e dados do solo",
"planta de culturas e solo":"plano de cultivo e dados do solo",
"planta de cultura e solo":"plano de cultivo e dados do solo",
"comportamento de caking":"tendência ao empedramento",
"Contexto autoritário":"Fontes de referência",
"Revisão <a":"Consulte <a",
"NIH PubChem registros químicos":"registros químicos do NIH PubChem",
"citação":"cotação",
"Selecção técnica":"Seleção técnica",
"Selecção":"Seleção",
">Category<":">Categoria<",
"controles de trabalhadores":"medidas de segurança ocupacional",
"formulação-screening":"avaliação de formulações",
"remoção do solo":"remoção de sujeira",
"Homologagem":"Perfil de homólogos",
"Contacte as vendas":"Entre em contato com a equipe comercial",
"activa":"ativa",
"actual":"atual",
"exacta":"exata",
"exacto":"exato",
}
SLES={
"Lauril Éter Sulfato de Sódio":"Lauril éter sulfato de sódio",
"Home Care &amp; Limpeza Industrial":"Cuidados domésticos e limpeza industrial",
"Surfactante e matéria-prima antimicrobiana":"Matéria-prima tensoativa aniônica",
"surfactante éter-sulfato aniônico":"tensoativo aniônico do tipo éter sulfato",
"para espuma, molhamento e distensão":"para formação de espuma, umectação e detergência",
"graus específicos de concentração e etoxilação":"graus definidos pelo nível de etoxilação e teor de matéria ativa",
"Formulação e mercado específico":"Conforme a formulação e o mercado-alvo",
"material bruto":"matéria-prima",
"controles de trabalhadores":"medidas de segurança ocupacional",
">Category<":">Categoria<",
"Matéria-prima surfactante e antimicrobiana":"Tensoativo aniônico",
"Fórmula e jurisdição específicas":"Conforme a formulação e a legislação do mercado-alvo",
"Especificações públicas":"Base da especificação",
"Não publicado — vendas em contato":"Solicitar a especificação vigente à equipe comercial",
"uma fabricante químico":"um fabricante químico",
"sles fornecedor de produtos de limpeza":"Fornecedor de SLES para produtos de limpeza",
"Preço a granel":"Preço de SLES para volumes comerciais",
"sles para formulação de detergentes":"SLES para formulações de detergentes",
"sles fabricante SDS e COA":"Fabricante de SLES: SDS e COA",
"áreas de formulação-screening":"áreas de avaliação de formulações",
"Sistemas de espuma, de humidade e de remoção do solo":"Sistemas de espuma, umectação e remoção de sujeira",
"espuma, molhar e remover o solo":"espuma, umectação e remoção de sujeira",
"Homologagem exacta, etoxilação ou concentração activa":"Perfil de homólogos, etoxilação e teor de matéria ativa",
"o homólogo exato, a etoxilação ou a concentração ativa":"o perfil de homólogos, o nível de etoxilação e o teor de matéria ativa",
"base de ph":"valor de pH",
"Autorização biocida e alegações de produtos acabados":"Alegações regulatórias do produto acabado",
"Avaliar a autorização biocida e alegações de produtos acabados":"Verifique as alegações permitidas e os requisitos regulatórios do produto acabado",
"Solicitar o caderno de especificações SLES atual":"Solicitar a especificação vigente de SLES",
"Revisão <a":"Consulte <a",
"Lidar com SLES sob o SDS atual":"Manuseio conforme a FDS vigente",
"Questões relativas aos compradores industriais":"Perguntas de compradores industriais",
"Pasta de Ingredientes de Limpeza":"Portfólio de ingredientes para limpeza",
'value="Sodium Lauryl Ether Sulfate (SLES) for Industrial Cleaning"':'value="Lauril éter sulfato de sódio (SLES)"',
'product="Sodium Lauryl Ether Sulfate (SLES) for Industrial Cleaning"':'product="Lauril éter sulfato de sódio (SLES)"',
}
def apply(path,mapping):
 raw=path.read_text(encoding='utf-8'); out=raw
 for a,b in mapping.items(): out=out.replace(a,b)
 out=re.sub(r">(?:Handle\s+[^<]+?|[^<]+?\s+Handle)\s+under the current SDS<",">Manuseio conforme a FDS vigente<",out,flags=re.I)
 if out!=raw:path.write_text(out,encoding='utf-8');return True
 return False
def meta(path):
 rel=path.relative_to(ROOT/'pt');raw=path.read_text(encoding='utf-8')
 if len(rel.parts)!=3:return False
 m=re.search(r'<h1[^>]*>([^<]+)</h1>',raw)
 if not m:return False
 n=html_std.unescape(m.group(1)).strip();cat=rel.parts[1]
 t={
 'food-ingredients':f'{n}: solicite especificação, grau alimentício, COA, embalagem e cotação para compras B2B internacionais.',
 'animal-nutrition':f'{n}: solicite especificação, grau para alimentação animal, COA, embalagem e cotação para compras B2B internacionais.',
 'home-care-industrial-cleaning':f'{n} para produtos de limpeza: solicite especificação, grau técnico, COA, embalagem e cotação B2B.',
 'water-treatment':f'{n} para tratamento de água: solicite especificação, grau técnico, COA, embalagem e cotação B2B.',
 'mining':f'{n} para mineração e beneficiamento: solicite especificação, grau técnico, COA, embalagem e cotação B2B.',
 'agricultural-fertilizers':f'{n} para fertilizantes: solicite especificação, análise de nutrientes, COA, embalagem e cotação B2B.'}.get(cat)
 if not t:return False
 e=html_std.escape(t,quote=True);out=raw
 for s in (r'(<meta name="description" content=")[^"]*(")',r'(<meta property="og:description" content=")[^"]*(")',r'(<meta name="twitter:description" content=")[^"]*(")'):
  out=re.sub(s,lambda x:x.group(1)+e+x.group(2),out,count=1)
 pv=html_std.escape(n,quote=True);out=re.sub(r'(<input name="product" value=")[^"]*(")',lambda x:x.group(1)+pv+x.group(2),out,count=1)
 out=re.sub(r'((?:const|let|var)\s+product=)"[^"]*"',lambda x:x.group(1)+'"'+n.replace('"','\\"')+'"',out,count=1)
 if out!=raw:path.write_text(out,encoding='utf-8');return True
 return False
def main():
 c=0
 for p in (ROOT/'pt').rglob('*.html'):c+=apply(p,GLOBAL)
 c+=apply(ROOT/'pt/products/home-care-industrial-cleaning/sles.html',SLES)
 for p in (ROOT/'pt/products').glob('*/*.html'):c+=meta(p)
 print(f'Repaired {c} Portuguese HTML files')
if __name__=='__main__':main()
