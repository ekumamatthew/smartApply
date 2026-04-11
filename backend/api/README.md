<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## SwiftApplyHQ Environment

Set these in `backend/api/.env`:

```bash
# Existing
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=https://www.swiftapplyhq.com,https://smart-apply-<preview>.vercel.app
EXTENSION_ORIGIN=chrome-extension://<extension-id>
BETTER_AUTH_URL=http://localhost:3001
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free

# Durable object storage (S3/R2)
OBJECT_STORAGE_BUCKET=swiftapplyhq-cv
OBJECT_STORAGE_REGION=auto
OBJECT_STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
OBJECT_STORAGE_ACCESS_KEY_ID=...
OBJECT_STORAGE_SECRET_ACCESS_KEY=...
OBJECT_STORAGE_FORCE_PATH_STYLE=true

# AI limits / quotas
AI_MAX_PER_MINUTE=20
AI_MAX_PARSE_PER_DAY=4
AI_MAX_GENERATE_PER_DAY=4

# Billing / credits (Flutterwave)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_or_LIVE_...
FLUTTERWAVE_REDIRECT_URL=https://www.swiftapplyhq.com/dashboard/settings?billing=success
FLUTTERWAVE_CANCEL_URL=https://www.swiftapplyhq.com/dashboard/settings?billing=cancelled
# Optional but recommended for webhook verification:
FLUTTERWAVE_WEBHOOK_HASH=your_flutterwave_webhook_hash
BILLING_CURRENCY=USD
CREDITS_PER_USD=100
MIN_PURCHASE_USD_CENTS=100
CREDIT_COST_PARSE=40
CREDIT_COST_GENERATE=25
```

Metrics endpoint: `GET /metrics`
Request tracing header: `x-request-id`

## CV Optimization Endpoints

- `GET /api/cv/templates` - returns active CV templates (10 seeded designs)
- `POST /api/cv/optimize` - tailors selected/default CV to a job description
- `GET /api/cv/:id/optimizations` - optimization history for a CV (includes `structuredCvJson`)

## Billing Webhook (Flutterwave)

- Endpoint: `POST /api/billing/webhook/flutterwave`
- Set this URL in Flutterwave dashboard webhooks.
- If you set `FLUTTERWAVE_WEBHOOK_HASH`, webhook requests must include matching `verif-hash` header.
- Webhook flow:
  1. receives event
  2. finds order by `tx_ref`
  3. verifies transaction with Flutterwave API
  4. credits wallet idempotently

## Project setup

```bash
$ npm install
```

## Auto Migrations

Backend start commands now auto-run pending Drizzle migrations before boot:

- `npm run start`
- `npm run start:dev`
- `npm run start:debug`
- `npm run start:prod`

You can also run migrations manually:

```bash
npm run db:migrate
```

The migration runner is baseline-aware for existing databases: it marks already-present schema migrations as applied and only executes truly pending files.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
