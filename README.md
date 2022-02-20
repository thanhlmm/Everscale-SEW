# Everscale SEW

<p align="center">
    <img src="http://www.plantuml.com/plantuml/proxy?cache=yes&src=https://raw.githubusercontent.com/EverscaleGuild/Everscale-SEW/main/feature/flow.puml"/>
</p>

## Develop environment require

- `POSIX` (bash, grep, cut, sort, etc)
- `nvm` https://github.com/nvm-sh/nvm
- `yarn` https://yarnpkg.com/getting-started/install
- `docker` https://docs.docker.com/engine/install

### Dependencies

```shell
nvm use $(yarn --ignore-engines --silent nvm)
yarn install
```

## Develop

```shell
yarn test
```

### Deploy

`local`
```shell
yarn contract-deploy-local
```

`dev`
```shell
yarn contract-deploy-dev
```
