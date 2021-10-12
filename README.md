# export-server-POC

## Usage

All dependencies are installed locally only.

`npm install`

`npm run start`

The server receives POST requests to `localhost:3000`.

Screenshots are saved in `./screenshots` directory.

Example of POST request to `localhost:3000` with JSON in body:

```
{
              "chart":
                {
                  "type": "pie",
                  "data":
                    [
                      { "x": "Apples", "value": "128.14", "fill": "green" },
                      { "x": "Oranges", "value": "128.14", "fill": "orange" },
                    ],
                }
            }
```

Also, [here is the prepared Network graph with images in nodes on Playground](https://playground.anychart.com/gTNmoegf/1) that demonstrates how it works with the export server.

## Loading tests

To launch load tests execute in another terminal command `npm run load-test`.