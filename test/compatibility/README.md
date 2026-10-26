# Storybook compatibility

```sh
yarn workspace @loki/test-compatibility build sb8.6.19-vite
yarn workspace @loki/test-compatibility test sb8.6.19-vite docker static
```

Targets: `app`, `docker`, `lambda`. Modes: `static`, `dev` (Storybook 8/Vite).
For Lambda, first build the image with
`yarn workspace @loki/example-running-renderer-aws-lambda build`.

Checks discovery, skipped stories, asset loading, screenshots, visual differences,
and reference preservation. References are generated per run. Lambda also checks
two concurrent captures.

Fixtures pin Storybook 5–8. Webpack 4 and react-draggable are pinned so the older
builders work on Node 20.
