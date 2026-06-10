# Paid Packages

This folder is a placeholder for the **paid** RedactUs npm packages — primarily
`@redactus/pro` (image-margin crop, rectangle redaction, dual-path preview, server-side
Layer 2). Those packages are developed in the private `docbones43/RedactUs-pro`
repository.

The **free** engine is published from this repository at the root:

```bash
npm install redactus
```

Then:

```js
import { redactText } from "redactus";
const { redactedText } = redactText("Patient: John Smith, NHS 943 476 5919", { region: "UK" });
```

See the root [`package.json`](../package.json) for the canonical entry point.
