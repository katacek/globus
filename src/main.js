const Apify = require('apify');
const { handleStart, handleList, handleDetail } = require('./routes');

const { utils: { log } } = Apify;

const proxyConfiguration = await Apify.createProxyConfiguration({
    groups: ['CZECH_LUMINATI'], // List of Apify Proxy groups
    countryCode: 'CZ',
    });

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    requestQueue.addRequest({url: 'https://www.iglobus.cz'});
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        useApifyProxy: true,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: false,
        maxConcurrency: 50,
        
        handlePageFunction: async (context) => {
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            switch (label) {
                case 'LIST':
                    return handleList(context);
                case 'DETAIL':
                    return handleDetail(context);
                default:
                    return handleStart(context);
            }
        },
    });
 
    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
