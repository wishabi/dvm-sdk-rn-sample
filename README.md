# dvm-sdk-rn-sample

Sample integration of `@flipp/dvm-sdk-native`, Flipp's React Native SDK, into an [Expo](https://expo.dev) app.

The Flipp Platform SDK lets a retailer's mobile app render its publications (digital flyers / circulars) in two formats: traditional print form (SFML) or Digital Visual Merchandising form (DVM). The DVM format renders publications dynamically, staying responsive across screen sizes while giving users ways to interact with individual offers.

This app walks the core SDK flow: search a merchant's publications (by store or by postal code), pick one from the results, and render it with `FlippPublication`. Tapping an offer opens an Item Details sheet; clipping an offer overlays a badge on it using annotations.

This sample targets SDK version **0.1.x**.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Layout](#project-layout)
- [Scripts](#scripts)
- [Integrating the SDK](#integrating-the-sdk)
- [API Reference](#api-reference)
  - [Client](#client)
  - [Provider and hook](#provider-and-hook)
  - [`FlippPublication`](#flipppublication)
  - [Imperative handle](#imperative-handle)
  - [Annotations](#annotations)
  - [Errors](#errors)
  - [Data models](#data-models)
  - [Endpoints](#endpoints)

## Getting Started

Flipp provides you with three things during onboarding. Keep all of them out of source control.

| Provided by Flipp       | Where it goes                                         |
| ----------------------- | ----------------------------------------------------- |
| NPM registry auth token | `~/.npmrc` (user-level, outside the repo)             |
| Client token            | `.env` as `EXPO_PUBLIC_DVM_CLIENT_TOKEN` (gitignored) |
| Merchant ID(s)          | Entered in the app's search screen at runtime         |

### 1. Authenticate to Flipp's package registry

`@flipp/dvm-sdk-native` is distributed through Flipp's JFrog Artifactory, not the public npm registry. The project's [`.npmrc`](./.npmrc) already maps the `@flipp` scope to that registry; you only need to supply the auth token Flipp provisioned for you. Add this line to your user-level `~/.npmrc`:

```
//flipplib.jfrog.io/artifactory/api/npm/dvm-sdk-npm-local/:_authToken=<token provided by Flipp>
```

Then confirm the registry answers:

```sh
npm view @flipp/dvm-sdk-native version
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure your client token

```sh
cp .env.example .env
```

Set `EXPO_PUBLIC_DVM_CLIENT_TOKEN` in `.env` to the client token provided by Flipp:

```
EXPO_PUBLIC_DVM_CLIENT_TOKEN=<client token provided by Flipp>
```

`.env` is gitignored; never commit a real token.

### 4. Run the app

The SDK depends on `react-native-webview` and `react-native-device-info`, so the app needs a native build (it does not run in Expo Go):

```sh
npx expo run:ios
```

```sh
npx expo run:android
```

Both commands generate the native project on first run, build it, install it on a simulator/emulator, and start the Metro dev server. After changing `.env`, restart Metro with `npx expo start --clear`.

### 5. Search for publications

On the search screen, enter the **merchant ID** provided by Flipp, then either a store code or a postal code + country. Merchant IDs identify your retailer in Flipp's platform and are assigned by Flipp during onboarding; store codes are your own store identifiers as configured with Flipp.

## Project Layout

```
index.ts              # Registers src/App with Expo
src/
  App.tsx             # Creates the DvmClient, mounts DvmProvider, drives search → results → renderer
  config/env.ts       # Reads the client token from EXPO_PUBLIC_DVM_CLIENT_TOKEN
  config/             # Static option lists (countries, languages, render types, annotation definitions)
  screens/            # SearchScreen, PublicationsScreen, RendererScreen
  components/         # UI building blocks (header, tabs, pickers, sheets, cards)
  hooks/              # usePublicationsSearch — fetch lifecycle around client.getPublications
  utils/format.ts     # Date, price and status formatting helpers
  theme.ts            # Colour, spacing and radius tokens
```

## Scripts

| Command             | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run ios`       | Build and run on an iOS simulator    |
| `npm run android`   | Build and run on an Android emulator |
| `npm start`         | Start the Metro dev server only      |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run lint`      | `expo lint`                          |

## Integrating the SDK

The steps below are what this sample does; they are the same steps for any React Native app.

### Requirements

- React Native with `react-native-webview` (>= 13.6) and `react-native-device-info` (>= 10) installed. Both are peer dependencies of the SDK and require a native build.
- An `.npmrc` mapping `@flipp` to Flipp's registry (see [Getting Started](#1-authenticate-to-flipps-package-registry)).

### Install

```sh
npm install @flipp/dvm-sdk-native react-native-webview react-native-device-info
```

### Create a client and provide it

Create one `DvmClient` per app session and share it through `DvmProvider` near the root of the tree ([`src/App.tsx`](./src/App.tsx)):

```tsx
import { createDvmClient, DvmProvider } from '@flipp/dvm-sdk-native';

const client = useMemo(() => createDvmClient({ clientToken }), [clientToken]);

return (
  <DvmProvider client={client}>
    <App />
  </DvmProvider>
);
```

### Fetch publications

Publications are always scoped to a merchant ID and narrowed by **either** a store code **or** a postal code + country code ([`src/hooks/usePublicationsSearch.ts`](./src/hooks/usePublicationsSearch.ts)):

```ts
const client = useDvmClient();

// By store
const { publications } = await client.getPublications({
  merchantId: '<merchant id>',
  storeCode: '<store code>',
  language: 'en',
});

// By postal code
const { publications } = await client.getPublications({
  merchantId: '<merchant id>',
  postalCode: '<postal code>',
  countryCode: 'CA',
  language: 'en',
});
```

### Render a publication

Pick a render type from the publication's `renderingTypes` and mount `FlippPublication` ([`src/screens/RendererScreen.tsx`](./src/screens/RendererScreen.tsx)):

```tsx
<FlippPublication
  ref={publicationRef}
  publicationId={publication.globalId}
  publicationInfo={{ merchantId: '<merchant id>', storeCode: '<store code>' }}
  renderType={publication.renderingTypes[0] ?? 'dvm_template'}
  language="en"
  onLoad={() => {
    /* register annotations, hide spinner */
  }}
  onError={({ error }) => showError(error.code)}
  onOfferPress={({ offer }) => openItemDetails(offer)}
  onExternalLinkPress={({ url }) => {
    /* validate scheme, then open */
  }}
/>
```

## API Reference

Everything below is exported from `@flipp/dvm-sdk-native`. Nothing else in the package carries compatibility guarantees.

### Client

#### `createDvmClient(config: DvmClientConfig): DvmClient`

Creates a configured client. Create one per app session and share it. Throws `SdkError("CLIENT")` when `clientToken` is missing.

| `DvmClientConfig` field | Type                | Description                                                         |
| ----------------------- | ------------------- | ------------------------------------------------------------------- |
| `clientToken`           | `string`            | Client token provided by Flipp. Sent as the `Authorization` header. |
| `endpoints?`            | `EndpointOverrides` | Non-production endpoint overrides. For Flipp-internal testing only. |

#### `DvmClient`

| Member                     | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `endpoints`                | The resolved `EndpointUrls` in effect (production unless overridden).              |
| `getPublications(options)` | Lists a merchant's publications for one store. Returns `Promise<PublicationList>`. |
| `getOffer(options)`        | Fetches one offer's full details by global ID. Returns `Promise<Offer>`.           |

The SDK never retries. Every failure surfaces immediately as an [`SdkError`](#errors) whose `retryable` flag lets you implement your own policy. Both methods accept an `AbortSignal` via `signal` for cancellation.

#### `GetPublicationsOptions`

`merchantId` is required, plus **exactly one** of `storeCode` or the `postalCode` + `countryCode` pair. The TypeScript type enforces this; an invalid combination at runtime throws `SdkError("CLIENT")` before any request is made.

| Field         | Type          | Description                                                                 |
| ------------- | ------------- | --------------------------------------------------------------------------- |
| `merchantId`  | `string`      | Merchant ID provided by Flipp.                                              |
| `storeCode`   | `string`      | Store identifier. Mutually exclusive with `postalCode`/`countryCode`.       |
| `postalCode`  | `string`      | Postal/ZIP code. Requires `countryCode`.                                    |
| `countryCode` | `string`      | Two-letter country code, e.g. `"CA"` or `"US"`. Requires `postalCode`.      |
| `language?`   | `string`      | Two-letter ISO 639-1 code, e.g. `"en"`, `"fr"`. Backend default if omitted. |
| `limit?`      | `number`      | Maximum publications to return.                                             |
| `pageToken?`  | `string`      | Cursor from a previous `PublicationList.nextToken`.                         |
| `signal?`     | `AbortSignal` | Cancels the request; rejects with `SdkError("CANCELLED")`.                  |

#### `GetOfferOptions`

| Field       | Type          | Description                |
| ----------- | ------------- | -------------------------- |
| `globalId`  | `string`      | The offer's global ID.     |
| `language?` | `string`      | Two-letter ISO 639-1 code. |
| `signal?`   | `AbortSignal` | Cancels the request.       |

### Provider and hook

#### `<DvmProvider client={DvmClient | null}>`

Provides a client to every SDK hook and component beneath it. Pass `null` while no client is available (for example before credentials are configured); components will resolve `null` and `FlippPublication` will throw until a client exists.

#### `useDvmClient(): DvmClient | null`

Returns the client from the nearest `DvmProvider`, or `null` when there is no provider or it has no client yet.

### `FlippPublication`

Renders a publication inside a WebView in any of its supported render types. Reads its client from the nearest `DvmProvider` unless a `client` prop is given; rendering with no client throws `SdkError("CLIENT")`.

Changing any of `publicationId`, `publicationInfo`, `renderType`, `language`, or `longPressDurationMs` tears down the rendering session and starts a new one. Event callbacks always see the latest props, so they can change freely.

#### Props

| Prop                   | Type                          | Description                                                                                                  |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `publicationId`        | `string`                      | Global ID of the publication to render.                                                                      |
| `publicationInfo`      | `PublicationInfo`             | `{ merchantId, storeCode }` or `{ postalCode, countryCode }`. Same addressing used to list publications.     |
| `renderType`           | `RenderType`                  | One of the publication's `renderingTypes`: `dvm_template`, `dvm_static`, `sfml_vertical`, `sfml_horizontal`. |
| `language?`            | `string`                      | Two-letter ISO 639-1 code. Default `"en"`.                                                                   |
| `longPressDurationMs?` | `number`                      | Enables long-press on offers with this hold duration. Off when omitted.                                      |
| `client?`              | `DvmClient`                   | Overrides the provider's client.                                                                             |
| `ref?`                 | `Ref<FlippPublicationHandle>` | Receives the [imperative handle](#imperative-handle).                                                        |

#### Event callbacks

| Callback                | Payload                                                 | When it fires                                                                                                                       |
| ----------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `onLoad`                | `{ legacyIdMap?: Record<string, string> }`              | The publication rendered. `legacyIdMap` maps legacy flyer-item IDs to offer global IDs when available.                              |
| `onError`               | `{ error: SdkError }`                                   | Loading failed (`CONTENT_LOAD_ERROR`). Terminal for this attempt: remount the component (e.g. change its `key`) to retry.           |
| `onOfferPress`          | `{ offer: Offer }`                                      | The user tapped an offer.                                                                                                           |
| `onOfferLongPress`      | `{ offer?: Offer }`                                     | The user long-pressed an offer (requires `longPressDurationMs`).                                                                    |
| `onOfferPressError`     | `{ error: SdkError; longPress: boolean }`               | The renderer could not load the pressed offer's details. Not terminal; the publication stays interactive.                           |
| `onPromotionPress`      | `{ promotion: Promotion }`                              | The user tapped a promotion (a non-offer item such as a banner).                                                                    |
| `onExternalLinkPress`   | `{ url: string }`                                       | The user tapped a take-to-merchant link. The SDK does not open it. Validate the scheme before passing it to `Linking.openURL`.      |
| `onOfferImpression`     | `{ globalIds: string[] }`                               | Offers that became at least 50% visible.                                                                                            |
| `onPromotionImpression` | `{ globalIds: string[] }`                               | Promotions that became at least 50% visible.                                                                                        |
| `onEngagedVisit`        | none                                                    | The visit counts as engaged: the user interacted, or the publication was visible for six seconds. Fires once per rendering session. |
| `onScroll`              | `{ flyerHeight: number; viewportBottomOffset: number }` | The user scrolled. Both in CSS pixels; their ratio is the scroll depth.                                                             |
| `onScrollToFinished`    | `{ offer?: Offer; promotion?: Promotion }`              | The renderer completed a `scrollToOffer` request. Not guaranteed to fire if the target cannot be resolved; do not block on it.      |

### Imperative handle

`FlippPublicationHandle`, reached through the component's `ref`. All methods are safe to call before `onLoad`; requests are held until the publication has rendered.

| Method                               | Description                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scrollToOffer(globalId)`            | Scrolls the item into view. Completion is reported via `onScrollToFinished`.                                                                                                    |
| `registerAnnotations(annotations)`   | Registers annotation definitions (badge images). A type must be registered before it can be applied.                                                                            |
| `addAnnotations(type, globalIds)`    | Overlays the registered annotation `type` on the given items.                                                                                                                   |
| `removeAnnotations(type, globalIds)` | Removes the annotation `type` from the given items.                                                                                                                             |
| `setVisible(visible)`                | Tells the renderer whether the publication is on screen (e.g. hosting tab focused). Drives the engaged-visit timer. The publication is treated as visible until told otherwise. |

### Annotations

An `Annotation` is an image drawn on top of individual items in a rendered publication, for example a "clipped" checkmark. This sample uses one to mark clipped offers ([`src/config/annotations.ts`](./src/config/annotations.ts)).

| `Annotation` field | Type                 | Description                                                                                                           |
| ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `type`             | `string`             | Your identifier for this definition, used with `addAnnotations`/`removeAnnotations`.                                  |
| `imageUrl`         | `string`             | URL of the image to overlay. Loaded by the renderer, so it must be reachable from the device, not bundled in the app. |
| `width?`           | `number`             | Rendered width in CSS pixels. Image's own size if omitted.                                                            |
| `height?`          | `number`             | Rendered height in CSS pixels. Image's own size if omitted.                                                           |
| `position?`        | `AnnotationPosition` | `top-left` (default), `top-right`, `bottom-left`, or `bottom-right`.                                                  |

```tsx
const CLIPPED: Annotation = {
  type: 'clipped',
  imageUrl: '<your badge image url>',
  width: 32,
  height: 32,
  position: 'top-right',
};

<FlippPublication
  ref={publicationRef}
  onLoad={() => {
    publicationRef.current?.registerAnnotations([CLIPPED]);
    publicationRef.current?.addAnnotations('clipped', clippedOfferIds);
  }}
  {...props}
/>;
```

Things to know:

- Annotations are per rendering session. Register and re-apply them in `onLoad` for every mount.
- The SDK does not persist annotations. Which items are clipped is your app's state to store and re-apply.
- More than one type can apply to the same item, so a "coupon" and a "clipped" badge can sit on one offer together.

### Errors

#### `SdkError`

The single error type thrown across the SDK's public boundary. Extends `Error`.

| Field       | Type           | Description                                             |
| ----------- | -------------- | ------------------------------------------------------- |
| `code`      | `SdkErrorCode` | Category of failure (see below).                        |
| `retryable` | `boolean`      | Whether retrying the same operation may succeed.        |
| `status?`   | `number`       | HTTP status, when the error came from an HTTP response. |
| `cause?`    | `unknown`      | The original error, preserved for debugging.            |

#### `isSdkError(error): error is SdkError`

Type guard. Checks structurally rather than with `instanceof`, so it keeps working when multiple copies of the SDK end up in one bundle.

#### `SdkErrorCode`

This union is extensible: new codes may be added in minor releases, so handle unknown codes with a `default` branch.

| Code                 | Meaning                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `NETWORK`            | The request never completed (DNS, connection reset, offline).                 |
| `TIMEOUT`            | The request exceeded its time budget.                                         |
| `AUTH_FAILED`        | The client token was rejected (401/403).                                      |
| `INVALID_RESPONSE`   | The server responded, but the payload failed validation.                      |
| `RATE_LIMITED`       | The request was throttled (429).                                              |
| `SERVER`             | A 5xx response.                                                               |
| `CLIENT`             | A non-auth 4xx response, or invalid SDK usage (bad configuration/arguments).  |
| `CANCELLED`          | The caller aborted via `AbortSignal`.                                         |
| `CONTENT_LOAD_ERROR` | The renderer failed to load or display the publication or an offer's details. |

```ts
try {
  await client.getPublications(options);
} catch (err) {
  if (isSdkError(err)) {
    switch (err.code) {
      case 'AUTH_FAILED':
        /* check the client token */ break;
      case 'CANCELLED':
        /* superseded request; ignore */ break;
      default:
        if (err.retryable) scheduleRetry();
    }
  }
}
```

### Data models

Models mirror Flipp's Curator v2 JSON format. Enum-like string fields (`offerType`, `Media.type`, `PromotionAction.actionType`, and so on) are normalized to bare values such as `"IMAGE"` and are **extensible**: tolerate values you do not recognise. Dates are ISO-8601 strings.

Every publication, offer, promotion and product carries a `globalId`, its unique identifier across all Flipp content.

| Type                               | What it is                                                                                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Publication`                      | Metadata for one publication: `globalId`, `merchantId`, `dates` (`ContentDates`), `details` (`ContentDetails`: name, description, image URLs, colours), `language`, `legacyIds`, `groupId`, `renderingTypes`, `tags`. |
| `PublicationList`                  | `publications`, optional `nextToken` for the next page, optional `total`.                                                                                                                                             |
| `Offer`                            | A purchasable deal: `globalId`, `products`, `productIds`, `dates`, `pricing` (`OfferPricing`), `metadata` (`OfferMetadata`), `offerDetails` (`OfferDetails`), `details`, `language`, `legacyIds` (`OfferLegacyIds`).  |
| `OfferPricing`                     | `offerType`, `price`, `salePrice`, `amountOff`, `percentOff`, `conditionType`, `purchaseMethods`, quantities, `priceRange`/`salePriceRange` (`PriceRange`), `loyaltyPoints`, `labels`.                                |
| `OfferDetails`                     | Merchandising copy: `disclaimer`, `saleStory`, `prePriceText`, `postPriceText`, `keywords`, `unit`, `unitAmount`.                                                                                                     |
| `Product`                          | A product an offer applies to: `globalId`, `descriptor`, `additionalIds` (`sku`, `gtin`, `mpn`), `metadata` (`ProductMetadata`), `details`, `productDetails` (`specs`, `media`, `features`).                          |
| `Promotion`                        | A non-purchasable merchandising element (banner, link, call-out): `globalId`, `details`, `action` (`PromotionAction`: `actionType`, `target`), `legacyFlyerItemIdMap`.                                                |
| `Media`                            | `type`, `url`, `altText`, `primary`.                                                                                                                                                                                  |
| `RenderType`                       | `'dvm_template' \| 'dvm_static' \| 'sfml_vertical' \| 'sfml_horizontal'`. `RENDER_TYPES` lists all values; `isRenderType(value)` is a type guard for dynamic input.                                                   |
| `Annotation`, `AnnotationPosition` | See [Annotations](#annotations).                                                                                                                                                                                      |

All model types are exported for use in your own code: `ContentDates`, `ContentDetails`, `Media`, `Publication`, `PublicationLegacyIds`, `PublicationList`, `Offer`, `OfferPricing`, `OfferMetadata`, `OfferDetails`, `OfferLegacyIds`, `PriceRange`, `Product`, `ProductAdditionalIds`, `ProductMetadata`, `ProductDetails`, `ProductSpec`, `Promotion`, `PromotionAction`, `RenderType`, `Annotation`, `AnnotationPosition`.

### Endpoints

| Export                 | Description                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PRODUCTION_ENDPOINTS` | The frozen production `EndpointUrls` the SDK uses by default (`curatorBaseUrl`, `rendererUrl`).                        |
| `EndpointUrls`         | The resolved endpoints exposed on `DvmClient.endpoints`.                                                               |
| `EndpointOverrides`    | Partial overrides accepted by `createDvmClient`. Intended for Flipp-internal testing; retailer apps should not set it. |
