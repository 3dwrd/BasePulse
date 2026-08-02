# Checklist de lanzamiento — tu lado / mi lado

Estado al **2026-08-02, 20:25**. Marcá lo tuyo, yo marco lo mío.

## Hecho hoy

- [x] Post #1 en Farcaster `@usebasepulse` + post #2 en X personal (vos)
- [x] Formulario del ecosistema de Base enviado con el logo (vos)
- [x] Logo 1024×1024 servido en `https://basepulse.botsniper.xyz/logo-1024.png` (yo)
- [x] Screenshots frescos portrait + desktop en `docs/assets/basedev/` (yo)
- [x] Copy de submissions lista (`docs/basedev-project-submission.md`) (yo)
- [x] `access_log` dedicado del vhost → `/var/log/nginx/basepulse.access.log` (yo)
- [x] 6 commits pusheados a GitHub — el repo público ya refleja el trabajo real (yo)
- [x] Correo verificado en GitHub → 36/42 commits atribuidos; identidad git normalizada en
      13 repos de los dos servidores (vos + yo)
- [x] "Include private contributions" activado → la gráfica pasó de **5 a 57** contribuciones,
      51 de repos privados, verificado desde fuera sin sesión (vos)
- [x] Blockaid enviado por la vía Developer (vos)
- [x] App registrada en Base Dashboard y `base:app_id` nuevo desplegado en el sitio (vos + yo)
- [x] Falsa alarma descartada: la atribución ERC-8021 **sí llega** por los dos caminos de
      login; el que medía mal era el verificador. Marcador real 4/5 (yo)

---

## TU LADO (nadie más lo puede hacer)

### 1. ~~Verificar el correo en GitHub~~ — ✅ HECHO 2026-08-02

**Antes:** 41 commits, los 41 huérfanos (`author: null`).
**Después:** **36 de 42 atribuidos a `3dwrd`**. Los 6 que siguen huérfanos son exactamente los
firmados como `root@vmi3158163…`; no se recuperan sin reescribir historia ya pusheada.

El `git config` de los **11 repos de Contabo** + el global quedaron normalizados a
`28882411+3dwrd@users.noreply.github.com` (la dirección se deduce del user id de la API, no hizo
falta copiarla a mano). De acá en adelante todo se atribuye solo, sin exponer el correo real.
**Ya podés marcar "Block command line pushes that expose my email"** en
`github.com/settings/emails`: los servidores ya no mandan tu correo.

Pendiente menor en GitHub: tu perfil no tiene **nombre ni bio** (`name: null` en la API) y el
LinkedIn va a enlazar ahí. Dos minutos en `github.com/settings/profile`.

Pasos originales, por si hay que repetirlo en otra máquina:

1. Entrá a **https://github.com/settings/emails**
2. **Add email address** → `hersonc00@proton.me` → **Add**
3. GitHub manda un correo a esa dirección → abrilo → **Verify email address**
4. Refrescá la página de Emails. Los 35 commits firmados con ese correo se atribuyen
   **retroactivamente** (los 6 firmados como `root@vmi3158163…` no se recuperan; no vale la
   pena reescribir historia ya pusheada por 6).
5. En la misma página marcá **"Keep my email addresses private"** y copiá la dirección que te
   muestra, con esta forma: `1234567+3dwrd@users.noreply.github.com`
6. **Pasámela** y yo cambio el `git config` de los dos servidores para que de ahora en adelante
   los commits se atribuyan sin exponer tu correo real.

> ⚠️ **Gotcha:** en esa misma pantalla hay una segunda casilla, *"Block command line pushes that
> expose my email"*. **No la marqués todavía.** Los servidores siguen firmando con
> `hersonc00@proton.me`; si la activás antes del paso 6, el próximo `git push` desde el VPS se
> rechaza. Marcala después de que yo confirme el cambio.

### 2. ~~Blockaid~~ — ✅ ENVIADO 2026-08-02 por la vía Developer

Queda esperar respuesta. Si algún día aparece un aviso en una wallet concreta, la otra puerta
es `https://report.blockaid.io/mistake`.

Pasos originales y bloque de texto, por si hay que reenviarlo:

Es lo que alimenta los avisos rojos de MetaMask y Coinbase Wallet. Base lo recomienda
explícitamente en `docs.base.org/base-chain/security/avoid-malicious-flags`. Un visitante nuevo
que ve una alarma no vuelve.

1. Entrá a **https://report.blockaid.io/**
2. Elegí la opción de **Developer / "verify a project"** (no la de reportar algo malicioso).
   Es una app de JavaScript, no pude leer los campos exactos desde acá — pero todo lo que te
   pueda pedir está abajo.
3. Si en algún momento ya te aparece un aviso en una wallet concreta, esa es otra puerta:
   **https://report.blockaid.io/mistake**

**Bloque para copiar y pegar:**

```
Project name: BasePulse
Website / domain to verify: https://basepulse.botsniper.xyz
Chain: Base mainnet (chain id 8453)
Contract: 0xd2240b90486F63858ED823a2620cb6DC6FcB6019 (verified on BaseScan)
Category: Portfolio / analytics dashboard (read-only utility)
Contact: hersonc00@proton.me
Base Builder Code: bc_bo6g6vzn
GitHub (public source): https://github.com/3dwrd/BasePulse
Farcaster: @usebasepulse

Description:
BasePulse is a free, read-only utility dashboard for the Base ecosystem: token portfolio
lookup, a gas-fee tracker with 7-day historical guidance, and an onchain reputation score
with a breakdown of what drives it. Anyone can look up any Base address without connecting
a wallet or creating an account. Connecting a wallet is optional and only needed to view
your own portfolio or to record a snapshot.

Risk profile:
- The app never takes custody of funds. The single deployed contract, PortfolioSnapshot, is
  an append-only ledger: "No funds are held; this is a pure write/append ledger."
- There is exactly one state-changing method, record(bytes32 fingerprint, bytes8 builderCode).
  It is not payable, takes no value and moves no tokens.
- The app never requests a token approval. No approve, no permit, no setApprovalForAll exists
  anywhere in the codebase.
- Only a keccak256 hash goes onchain. No balances, no amounts, no personal data.
- The single transaction the UI offers is fully described before signing, and the button copy
  matches the onchain effect exactly.
- Wallet authentication is standard SIWE — signature only, no transaction.
- Standard connection methods offered: Base Account SDK, injected/EIP-6963 wallets, Coinbase
  Wallet SDK and WalletConnect.
- No geo-blocking or regional restrictions.
- Source is public: https://github.com/3dwrd/BasePulse

Known weak signals, disclosed up front:
- The domain botsniper.xyz was registered 2026-04-15 (young) on a .xyz TLD, and BasePulse runs
  on a subdomain alongside unrelated personal projects.
- Usage is near zero: the app was announced publicly for the first time on 2026-08-02.
```

Si te pide una prueba de que controlás el dominio, decime y te dejo el archivo o el meta tag
donde lo pidan.

### 3. Base Dashboard — ⚠️ HAY DOS APPS "BasePulse" DUPLICADAS

Al registrar hoy por el flujo `/register` se creó una **segunda** ficha. Ahora existen:

| App | `base:app_id` | Foto | Estado |
|---|---|---|---|
| La de hoy (`/register`) | `6a6f93a5a8c4f2b6db3b3e11` | ❌ sin foto — se saltó el paso *customize* | es la que el sitio sirve ahora |
| La de julio | `6a668e04281b6db318994d46` | ✅ con foto | ya no puede verificar el dominio |

**RESUELTO (2-ago): se queda la de julio, `6a668e04281b6db318994d46`** — la que ya estaba
confirmada y tiene foto. El sitio volvió a servir ese id (build + restart hechos, verificado en
vivo). El id efímero `6a6f93a5a8c4f2b6db3b3e11` queda muerto: **no resucitarlo.**

**Limitación encontrada: el dashboard no deja borrar ni editar apps.** La ficha vacía creada hoy
se queda ahí, huérfana. No estorba —nunca va a poder verificar el dominio, porque su id ya no lo
sirve nadie— pero tampoco se puede limpiar.

**Consecuencia a resolver:** si tampoco se puede editar la ficha de julio, no hay forma de
subirle icono/screenshots/descripción por la UI. Antes de dar esto por cerrado hay que probar:
entrar a la ficha en sí (no a la lista), o el enlace directo `dashboard.base.org/register/customize`.
Si ninguna funciona, es tema de soporte de Base, no algo que se arregle del lado del código.

**Ojo con el builder code:** es uno solo (`bc_bo6g6vzn`) y vive a nivel de cuenta, no de app.
No hay que duplicarlo ni pedir otro.

### 3b. Base.dev / dashboard.base.org — proyecto con metadata

Distinto del formulario de Google que ya mandaste. Ahí ya tenés el Builder Code registrado; lo
que falta es la **ficha del proyecto** (name, icon, tagline, description, screenshots, category,
primary URL, builder code). Es el reemplazo oficial del empaquetado mini-app y el paso 1 del
camino de rewards. Todo el copy está en `docs/basedev-project-submission.md`.

### 4. DappRadar (opcional, menor prioridad)

Pide crear cuenta a mano. Borrador completo en `docs/dappradar-submission-draft.md`.

### 5. Foto y nombre real en LinkedIn

Ver `/root/LinkedIn-Perfil.md`. Sin foto, el perfil no sale en búsquedas.

---

### 6. Metadata de la app en Base Dashboard — ✅ HECHO 2026-08-02

Icono, thumbnail 1.91:1 (1200×628, 21 KB) y screenshots cargados y guardados. Los assets quedan
servidos en `https://basepulse.botsniper.xyz/press/` por si hay que volver a subirlos en otro
formulario.

**Falta confirmar una sola cosa: que el dominio quedó en *verified*.** El meta tag correcto
(`6a668e04281b6db318994d46`) está en vivo, así que solo hay que apretar el botón si no se apretó.

---

## MI LADO (dame luz verde y lo hago)

- [ ] Cambiar `git config user.email` de los dos servidores a tu dirección `@users.noreply` —
      **necesito que me la pases** (paso 1.5 de arriba).
- [ ] Post #4, el del bug de `dataSuffix` de wagmi: redactado en `docs/launch-posts-draft.md`.
      Ahora que el repo es público y está al día, el claim es verificable. Es el de más
      probabilidad de enganche real con builders de Base.
- [ ] Medir el lanzamiento en 48–72h con el `access_log` nuevo: visitas humanas reales vs
      escáneres, y si aparecen keys `score:*` en Redis (= alguien consultó una wallet).
- [ ] Rotar el deployer (wallet nueva + contraseña fuerte + redeploy ~0.0000016 ETH). Sigue
      pendiente de tu decisión, sin incendio: la wallet tiene $10.6 y 2 tx.
- [ ] Basename/ENS en la caja de búsqueda ("fase 3", nunca aprobada).

---

## Cómo se mide si esto funcionó

Antes del lanzamiento el marcador era: **0 usuarios, 0 keys `score:*` en Redis, 1 snapshot
onchain (el tuyo)**. Cualquiera de estas tres moviéndose es señal real; el resto es ruido de
escáneres. Ahora sí se puede separar por sitio gracias al `access_log` dedicado.
