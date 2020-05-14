const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const NO_OF_TOP_RESULTS_TO_BE_SAVED = 3;

/**
 * Troubleshooting
 */
const extraParamsIfNeeded = "";

/**
 * Search query format, make your own search query array
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

/**
 * Make some search queries combine with must and at least one term
 * This was basically my need, you can skip this part
 */
/**
const searchQueries = [];
const mustContainInQuery = [];
const atleastOneTerms = [];
if (queries && queries.length > 0) {
  searchQueries.pop();

  mustContainInQuery.forEach((must) => {
    queries.forEach((searchQuery) => {
      const search = {};
      search.query = searchQuery;
      search.mustContainTerms = must;
      searchQueries.push(search);
    });
  });

  atleastOneTerms.forEach((atleastOne) => {
    queries.forEach((searchQuery) => {
      const search = {};
      search.query = searchQuery;
      search.atleastOneTerms = atleastOne;
      searchQueries.push(search);
    });
  });
}
*/

main();

function main() {
  writeToFile(searchQueries, "input.json", true);
  const encodedUrls = googleEncodedUrls(searchQueries);
  const axiosAllGets = makeMultipleAxiosRequests(encodedUrls);
  resolveAllrequestsAndWriteToFile(axiosAllGets);
}

/**
 * Write your custom logic, enhance it
 * @param {*} responseData
 */
function scraping(responseData) {
  const item = {};
  try {
    const $ = cheerio.load(responseData);
    item.query = $("#sf > div > div > input").val();

    writeToFile(
      responseData,
      "html-dump/" +
        `${item.query}.index.html`.replace(" ", "-").replace("/", "-"),
      false
    );
    item.result = [];
    for (let i = 4; i < 4 + NO_OF_TOP_RESULTS_TO_BE_SAVED; i++) {
      listItem = {};
      listItem.title = $(
        `#main > div:nth-child(${i}) > div > div:nth-child(1)`
      ).text();
      listItem.description = $(
        `#main > div:nth-child(${i}) > div > div:nth-child(3) > div > div > div > div > div`
      ).text();
      item.result.push(listItem);
    }
  } catch (err) {
    console.error("Error while scraping: ", err);
  }
  return item;
}

/**
 * Make encoded google URL out of search params
 */
function googleEncodedUrls(searchQueries) {
  const encodedUrls = [];
  if (
    searchQueries &&
    searchQueries.length > 0 &&
    searchQueries[0].query &&
    searchQueries[0].query.length > 0
  ) {
    searchQueries.forEach((search) => {
      /**
       * The search query entered by the user.
       * Even though this parameter is optional, you must specify a value for at least one of the query parameters.
       *
       * The value specified for the q parameter must be URL-escaped.
       * Examples q=president
       */
      let q = search.query;
      /**
       * Additional search terms to check for in a document.
       * Examples	as_q=John+Adams
       */
      let as_q = search.searchTerms;
      /**
       * Identifies a phrase that all documents in the search results MUST contain.
       */
      let as_epq = search.mustContainTerms;
      /**
       * Identifies a word or phrase that SHOULD NOT APPEAR in any documents in the search results.
       * Examples	q=bass&as_eq=music.
       */
      let as_eq = search.shouldNotAppearTerms;
      /**
       * The search results must contain AT LEAST ONE of the additional search terms.
       * Examples	q=vacation&as_oq=London+Paris
       */
      let as_oq = search.mustContainAtLeastOneTerm;
      /**
       * Specifies that all search results should contain a link to a particular URL
       * Examples	as_lq=www.google.com
       */
      let as_lq = search.shouldContainLinkToURL;
      /**
       *  Specifies that all search results should be pages that are related to the specified URL.
       *
       */
      let as_rq = search.resultsRelatedtedToURL;

      let customQuery = "";
      if (q) customQuery += `&q=${q}`;
      if (q) customQuery += `&oq=${q}`;
      if (as_q) customQuery += `&as_q=${as_q}`;
      if (as_epq) customQuery += `&as_epq=${as_epq}`;
      if (as_eq) customQuery += `&as_eq=${as_eq}`;
      if (as_oq) customQuery += `&as_oq=${as_oq}`;
      if (as_lq) customQuery += `&as_lq=${as_lq}`;
      if (as_rq) customQuery += `&as_rq=${as_rq}`;

      if (customQuery && customQuery.includes("&q=")) {
        let googleBaseUrl = `https://www.google.com/search?${extraParamsIfNeeded}&${customQuery}`;
        encodedUrls.push(encodeURI(googleBaseUrl));
      } else {
        console.log("Query not valid");
      }
    });
  }
  return encodedUrls;
}

/**
 * Make axios get calls with fully encoded google queries
 * No. of axios requests = No. of queries
 */
function makeMultipleAxiosRequests(urls) {
  const axiosGetRequests = [];
  if (urls && urls.length > 0) {
    urls.forEach((url) => {
      axiosGetRequests.push(axios.get(url));
    });
  }
  return axiosGetRequests;
}

/**
 *
 * @param {*} axiosAllGets
 */
function resolveAllrequestsAndWriteToFile(axiosAllGets) {
  Promise.all(axiosAllGets)
    .then(function (responses) {
      const resultData = responses.map((response) => scraping(response.data));
      writeToFile(resultData, "output.json", true);
    })
    .catch((err) => console.error(err));
}

/**
 * Write to a JSON file
 * @param {*} data
 * @param {*} fileName
 */
function writeToFile(data, fileName, stringify) {
  const fileContent = stringify ? JSON.stringify(data, null, 2) : data;
  fs.writeFile(fileName, fileContent, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log(`${fileName} JSON file has been saved.`);
  });
}
