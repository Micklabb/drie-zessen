<div align="center">
  <a href="https://github.com/Micklabb/drie-zessen">
    <img src="https://www.erkendeheeren.nl/wp-content/uploads/2019/07/Erkende-Heeren-op-eenzame-hoogte_3.png" />
  </a>
</div>

# `drie-zessen`

Een Erkende Heeren Dobbelspel dat men tijdens Corona helaas niet meer in levende lijve kan spelen. Vandaar deze digitale versie die in je browser gespeeld kan worden. De server draait op Node.js en Colyseus en is gemaakt door IO'er Micky, lichting 2020. 

Het spel is beschikbaar via gratis hosting van Heroku. Deze hosting kent een aantal beperkingen, zoals beperkte uptime. Hieronder de link.

http://tijdelijkelink.com

## Hoe speel je

Als je op de link klikt kom je automatisch in een room met andere spelers. Je moet een gebruikersnaam kiezen om te spelen. Je kunt halverwege aanschuiven en weggaan zonder dat het spel stopt.

Om te communiceren zou ik discord aanraden, of een andere manier van spraakbellen. Hierdoor is de ervaring een stuk beter.

## Lokaal hosten en helpen ontwikkelen

Om zelf lokaal te hosten heb je de serverbestanden nodig. Hieronder staat aangegeven hoe je die gemakkelijk kan downloaden. Je hebt ook Node.js, git en geïnstalleerde dependencies nodig. Kijk in package.json in de main directory voor meer info hierover.

```
git clone https://github.com/Micklabb/drie-zessen.git
cd drie-zessen
npm install
npm run dev
```

Open [http://localhost:2567](http://localhost:2567) in je browser.

Als je zelf wilt werken aan het spel kan dit via git push requests. Voor meer info kan je het beste de Colyseus en PixiJS documentatie lezen. Daarnaast is het ook handig als je ongeveer weet hoe npm packages werken en hoe NodeJS werkt. De programmeertalen zijn vooral Javascript en Typescript. Het belangrijkste bestand voor de server is src/server/GameRoom.ts. Het belangrijkste bestand voor de client is src/client/Controls.ts.

**Server Packages**
Colyseus: https://docs.colyseus.io/

**Client Packages**
PixiJS: http://pixijs.download/release/docs/index.html
GSAP: https://greensock.com/docs/

## License

MIT