# Everscale SEW

<p align="center">
    <img src="https://www.plantuml.com/plantuml/png/bLBFRzCm5Bxxhx36fGsQa2R10Org3COkmAK8pY_nIsB5iIlRMPYqFvuNnwrih4fh3wtwyltutlTovpnOFusAkK7g0rWOkUj1c5dgZhUW72PFQcY6pff9Yoz66SlVV9TTxnyjFYUW7hIOhVGUTHHWzC3BHXv0U_vPoOP6jVdBhnwUqBe655v5gNirOOR-3PFosUGHnXpoyzilXbfmKioTxatDMB3ZrxlLzoE_xL2Z1OyxNbNQ41YhYa7ZvHCDLrH96c48XAOt3lbc__BmycTBl1EGKYsu6lq2emPltd-eAcxQ8-djqOjlHhcctfvi0prMi0Sr6it2X8G9HxeB9VXRNE0qJ4FJtvnCWtDS4T2jiS6JL28sBk0y-CdjcC1KlIm4TMEV3pujCO9k2HMkjgYX5WiaeicyR3nWy_Xqk4KcvbVI1P_bz__D2HdHoGd0dpzL0kmmuDQDURUsKInnmfKxbAq8f5UlHrlMabGSIobU2ng75Dio0mahz7WcXi2yJ0PKwDw35gPjUGCE6QSFsMTXlGNjsZMinHci-BIfGG_N5WRSlhiXvPH6DLzCYXUi9wiNmjUmHRmXAeTh5ZvBVL7Cas5qIme8h292hlA3cD7Pp1ejDssQYHOj4yK6Biv3dDUa8LYMfH0A0WorO7VqDOtg7m00"/>
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
