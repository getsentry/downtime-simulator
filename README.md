# Downtime simulator

A simple app for creating a temporary downtime based on the host, built with Next.JS and KV storage.

## Testing locally

Update your `/private/etc/hosts` to include some test hosts:

```
127.0.0.1 downtime-simulator.local
127.0.0.1 test1.downtime-simulator.local
127.0.0.1 test2.downtime-simulator.local
```

Set the root hostname and test hosts to your `.env.development.local`:

```
DOWNTIME_SIMULATOR_ROOT_HOSTNAME=downtime-simulator.local
NEXT_PUBLIC_DOWNTIME_SIMULATOR_HOSTS=test1.downtime-simulator.local,test2.downtime-simulator.local
```

Then you can run different instances of Next.JS for you to test.

To use the simulator:

```
DIR=.next-1 npm run dev -- -H downtime-simulator.local
```

To test a subdomain:

```
DIR=.next-2 npm run dev -- -H test1.downtime-simulator.local
```

The `DIR` env variable is required to run multiple instances of Next.JS locally, to avoid build conflicts.
