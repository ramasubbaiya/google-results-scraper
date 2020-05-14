# Google Results Scraper

Google results scraper: I was a given a boredom task to google stuffs and fill up excel sheet at my work. An excel sheet with 100 rows and 10 diff search terms. So basically 100 query words \* 10 must words => 1000 google searches entries.

That made me write this. It is not great project but it helped me to finish my work.

## Useful commands

Install dependencies

```bash
npm install
```

Run the project

```bash
npm start
```

## Query

```javascript
/**
 * Search query format, make your own search queries array
 * and replace this variable at line 15.
 *
 * Search query is saved in input.json
 */
const searchQueries = [
  {
    query: "tesla",
    searchTerms: "",
    mustContainTerms: "investment",
    mustContainAtLeastOneTerm: "",
    shouldNotAppearTerms: "",
    shouldContainLinkToURL: "",
    resultsRelatedtedToURL: "",
  },
];
```

### HTML

All google result html pages are saved under `html-dump`.

### Output

Google results is saved in output.json

### Troubleshooting

Google limits the no. of requests I was only able to do around 700 requests per day then I was geeting `429 Too Many Requests` error.
