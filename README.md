# Metodespillet

Universitetet i Agder og spillselskapet Agens AS samarbeider om å lage spill til bruk i undervisning av vitenskapelig metode og statistikk på universitet og høyskoler i Norge.

Målet med prosjektet er å utvikle spill som en læringsfrom som kan gjøre at studenter opplever metodefaget som mer gøy og motiverende.

Metoden vi benytter er brukersentrisk utvikling og en forskningsbasert, eksperimentell utviklingsprosess, der vi tester hypoteser og får brukerfeedback.

Vinter 2020/21 har laget vi en interaktiv spillbar prototype med

- en egen editor som muliggjør å lage spillnivåer uten å være utvikler
- enkelt å inkorporere informasjonskilder som video
- støtte for utmerkelser/badges
- kan brukes på egenhånd
- karakterer

Veikart for produktet er å

- teste spillet på studenter ved UiA for å samle innsikt
- utvikle spillbrett for flere temaer
- gjøre test av spillkonsepter også med studenter ved utdanningsinstitusjoner
- utvikle en MVP som kan taes i bruk fra høsten 2021

## Spillets anatomi

Metodespillet er et spillsystem bestående av et sett med spill/brett. Spilleren oppretter en avatar som kan vinne utmerkelser/badges for hvert spill, som gjør at man kan følge progresjonen opp mot tilgjengelige badges. I motsetning til et rent lineært spill hvor man må ha klart et spill (“nivå”) for å kunne gå til neste spill.

Hvert spill består av scener og valg. Det er spillerens valg som bestemmer hvilken scene som kommer.

En scene består av

- Header
  Image &&/|| Tekst
- Body
  Tekst, bilder, video,linker, dialog, monolog, “Skrik”
- Actions
  Gå til nye scener (angir flyten i spillet)
- State
  Endringer som eks trigger badges.
- Utvidet info
  Ekstra info som popper opp fra bunnen (eks bilde eller mulighetene for å vise en video ute av spill kontekst).

## Et “Serious Game”

Som et “serious game” har metodespillet først og fremst et læringsformål, og er sekundært et spill. Serious games har hensikter som ligger utenfor spillet. Der et spill skal primært underholde, vekke følelser, gi opplevelser, etc, skal et serious game skape forståelse, endre oppfattelse eller gi kunnskap.

Ved å dra nytte av elementene i spillmediet som skaper motivasjon, kan vi øke sannsynligheten for at en spiller skal lære noe nytt, og få en positiv mestringsopplevelse knyttet til emnet.

Når vi designer et serious game er vi derfor bevisste på å stadig etter måter vi kan gjøre formidlingen litt mer lik en spillopplevelse.

## Utvikle et spill i metodespillet

### Steg 1: Definere formål og læringsmål

Det viktigste steget i prosessen, er å definere hva formålet med spillet skal være. Ikke hold det i hodet, skriv det ned. Du er mer sannsynlig å lykkes med en god spillopplevelse dersom du begrenser formålet ditt. Dersom formålet ditt er sammensatt av flere tekniske/teoretiske konsepter kan det være en fordel å lage flere spill. Men dersom spillet lages for å gi en generell oversikt kan flere konsepter kombineres.

Når formålet er klart, så kan det være nyttig å definere læringsmål. Med et klart definert, begrenset formål og en liste med læringsmål har du nå et verktøy som kommer til å hjelpe deg til å evaluere alle kommende avgjørelser.
Læringsmål for nytt level:
Bli kjent med begrepene sammenheng og årssakssammenheng

### Steg 2: Finne kontekst

Dersom spillet er integrert i en kontekst, vil spilleren selv generere en rikere opplevelse enn det vi faktisk har designet. Spilleren fyller inn detaljer som ikke er der. Det er også en fordel dersom konteksten kan styrke formidlingen, dvs at det ikke er en dissonans mellom formål og kontekst.

Din oppgave er derfor å lage et bakgrunnsteppe hvor spillet kan foregå. Svar på spørsmål som:
Når finner det sted?
Hvor finner det sted?
Hva er det som skjer?
Hvilke karakterer møter man?
Er det noen gjenstander som befinner seg her?

### Steg 3: Lage flytdiagram med gode valg

Et flytdiagram viser scenene og flyten ifbm valgene spilleren tar fra start til slutt. Man kan bruke et verktøy som Whimsical (https://whimsical.com) eller rett og slett post-it-notes.
Man trenger ikke tekst og bilder i dette steget - det viktigste er å finne valgalternativ som oppleves som gode/reelle. Dvs, kan spilleren resonnere rundt hva man skal velge? Oppleves valgene integrert med spillet?

### Steg 4: Tekst, bilde, video

Hver scene trenger tekst, bilde og evt video (se anatomi av spillet over). Det kan være nyttig å ha et dokument hvor man går igjennom hver scene og skriver tekst (“body”), og finner/lager et bilde (“header image”).
Ved hjelp av Adobe Character Animator kan vi lage bilder og videoer av karakterene.
I tillegg kan scener har utvidet info som kan være ledetråder eller flere ressurser for å hjelpe i valget.

### Steg 5: Legge det inn i editoren

[Hva er Metodos](https://user-images.githubusercontent.com/1419964/112204433-f2c20180-8c13-11eb-89ad-c6ca04eedf89.mp4)

[Metodos filformat](https://user-images.githubusercontent.com/1419964/112204851-71b73a00-8c14-11eb-815c-d6d62432d6a5.mp4)

[Metodos spillmotor](https://user-images.githubusercontent.com/1419964/112204921-885d9100-8c14-11eb-919f-eccf2d226dda.mp4)

[Metodos spillerprofil](https://user-images.githubusercontent.com/1419964/112261865-e61dc780-8c6c-11eb-97ea-8fff3e28d07a.mp4)

[Editor oversikt](https://user-images.githubusercontent.com/1419964/112262404-e5d1fc00-8c6d-11eb-8b1d-42113624b75a.mp4)
- [Editor nytt spill](https://user-images.githubusercontent.com/1419964/112263647-ef5c6380-8c6f-11eb-8743-c1a1972d3fff.mp4)
- [Editor seksjon oversikt](https://user-images.githubusercontent.com/1419964/112264379-16fffb80-8c71-11eb-9fc2-e56e62771b99.mp4)











## URLer

Prosjekt plan: https://trello.com/b/y14DUpO6/uia-metodespill  
Figma: https://www.figma.com/file/EfKlhV3qLfO0VD49colUgl/metode

Live demo: https://agensdev.github.io/metodespill/game/  
Editor : https://agensdev.github.io/metodespill/editor/
