# Everscale SEW

<p align="center">
    <img alt="diagram gameplay flow" src="https://www.plantuml.com/plantuml/png/bL9DRzGm4BtxLrZbqbrK8LM20ofLMoYzK2v5S9x4asoqpdWPEmsL-kEPE4xbO5LeBxlQsVVnveslV00EGs-LttTq08PU-nqODtRKwWQin-oV2kfzosuWyzbPn_hDjwxTXJl6fmoq0p8ZTo4W5G8UVmz8DTwZzz3YjUrQqZLIGCvGZFxWo2-e6xHkl6Psemuye88XE1hwIZXA2A6hkmDGqA9MerAL-wDFRX-HVGqMJrB86plW2lqJ1XjMaplerv3lNtye9AD5SUrquogbefq-kvnzF-gB5WaP0bxgxPQSW76xLL27xb66CweazR2FX7hdFEhJX-VRvryRuIt0c4fm5OO99hSvV_zXkzMkMKXl5ozzsdTpwisBRQId2Xx0zewKJAAmu2P_eKH_He5Fmpoq_5oJPV0QrqHqupXwYah2fWLyW33uIsKmLoyBGQhvwH3o4XFeGb3nQfCQafaW2ItcPUCHkuulXnEP9R_jVFIPll_TN909dPq0mkkdoe1jkbNSMBTp6-KI2wxSeMp5e3oz7N9PIrvnBALy5ZAEAJPb1X6s6F2L60RNPIgmGJy48EEQHjVWKMcjetqUDZ2GR-QmZ2Em-NHQ0UtF6FQuUNSkoZbDQZwQb2vO3KmJuKlS8jqGhSSvYnuxEYhcYs5oomg8h3B2IkLUcCdPZOIiNPDdaaNBHAc1e_C8v_zf8coLfH2A0Wh9g2lv67hx5m00"/>
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

`compile`
```shell
yarn contract-compile
```

`localnet`
```shell
yarn contract-deploy-local
```

`testnet`
```shell
yarn contract-deploy-test
```

## Release

```shell
yarn release
```

## Frontend

- src: [github.com/EverscaleGuild/Everscale-SEW-fronten](https://github.com/EverscaleGuild/Everscale-SEW-frontend)
- demo: [everscaleguild.github.io/Everscale-SEW](https://everscaleguild.github.io/Everscale-SEW/)
