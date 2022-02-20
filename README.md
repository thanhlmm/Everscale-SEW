# Everscale SEW

<p align="center">
    <img src="http://www.plantuml.com/plantuml/proxy?cache=yes&src=https://raw.githubusercontent.com/EverscaleGuild/everscale-sew/main/feature/flow.puml?token=GHSAT0AAAAAABHKZ6A3K34JCXGWZKNCHY6CYQOVHZQ"/>
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

```shell
yarn contract-deploy-local
```
