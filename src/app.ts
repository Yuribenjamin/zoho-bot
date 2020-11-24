import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import cuid from 'cuid';
import chalk from 'chalk';

const userName = '';
const password = '';
const url = 'https://www.zoho.com/ar/people/';

/**
 *
 * @param ms
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param param0
 */
async function saveScreenshot({
  suffix,
  screenshot,
  sessionId = undefined,
}: {
  suffix: string;
  screenshot: string;
  sessionId?: string | undefined;
}) {
  const id = sessionId || cuid();
  const savePath = path.resolve(__dirname, `../screenshot/${id}-${suffix}.png`);
  console.log(chalk.magentaBright(savePath));
  await promisify(fs.writeFile)(savePath, screenshot);
}

/**
 *
 * @param param0
 */
const clean = async () => {
  const directory = path.resolve(__dirname, `../screenshot/`);
  const readdir = promisify(fs.readdir);
  const unlink = promisify(fs.unlink);
  try {
    const files = await readdir(directory);
    const unlinkPromises = files.map((filename: string) =>
      unlink(`${directory}/${filename}`)
    );
    console.log(chalk.red('[*] files deleted successfully'));
    return Promise.all(unlinkPromises);
  } catch (err) {
    console.log(err);
  }
};

/**
 *
 * @param err
 */
const logErrorAndExit = (err: any) => {
  console.log(
    chalk.red(`[*] an error occurred while processing your request \n ${err} `)
  );
  process.exit();
};

/**
 * @param url
 * @param userName
 * @param password
 */
(async (url, userName, password) => {
  // ? start and cleaning
  console.log(chalk.blue('Start cleaning screenshot Dir'));
  /**
   * todo: clean after 7 days
   */
  clean();
  const sessionId = cuid().substr(-7);
  console.log(
    chalk.green(`[1/7] Session created => iD:\n ----${sessionId}----`)
  );

  // ? browser launching
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  console.log(chalk.green('[2/7] launching successfully...'));

  // ? open new page
  const page = await browser.newPage();
  await page.goto(`${url}`, {
    waitUntil: 'networkidle0',
  });
  console.log(chalk.green('[3/7] Page loaded successfully'));

  // ? screenshot after page load
  const screenshot1 = await page.screenshot();
  console.log(chalk.green('[4/7] screenshot captured page loaded... \n path:'));
  saveScreenshot({ suffix: '0001', screenshot: screenshot1, sessionId });

  // ? press the login Btn
  await page.click('.zgh-login');
  console.log(chalk.green('[4/7] Login button was pressed'));
  await sleep(10000);

  // ? screenshot after pressing Btn && waiting to the page load
  const screenshot2 = await page.screenshot();
  console.log(
    chalk.green(
      '[5/7] screenshot captured Btn pressed navigation done... \n path:'
    )
  );
  saveScreenshot({ suffix: '0002', screenshot: screenshot2, sessionId });
  await sleep(10000);

  // ? fill login form
  await page.type('#login_id', `${userName}`);

  // ? screenshot after filling form
  const screenshot3 = await page.screenshot();
  console.log(chalk.green('[6/6] screenshot captured form filled... \n path:'));
  saveScreenshot({ suffix: '0003', screenshot: screenshot3, sessionId });

  // ? press submit
  await page.click('#nextbtn');
  await sleep(10000);

  // ? screenshot after submit pressed
  const screenshot4 = await page.screenshot();
  console.log(
    chalk.green('[7/7] screenshot captured submit btn was pressed ... \n path:')
  );
  saveScreenshot({ suffix: '0004', screenshot: screenshot4, sessionId });

  // ? fill password
  await page.type('#password', `${password}`);

  // ? screenshot after submit pressed
  const screenshot5 = await page.screenshot();
  console.log(
    chalk.green('[7/7] screenshot captured password filled... \n path:')
  );
  saveScreenshot({ suffix: '0005', screenshot: screenshot5, sessionId });

  // ? press submit
  await page.click('#nextbtn');
  await sleep(10000);

  // ? screenshot after submit pressed
  const screenshot6 = await page.screenshot();
  console.log(
    chalk.green('[7/7] screenshot captured submit btn was pressed  \n path:')
  );
  saveScreenshot({ suffix: '0006', screenshot: screenshot6, sessionId });
  await sleep(20000);

  // ? screenshot after check-in or out
  /**
   * todo: condtion for check in and out
   */
  await page.click('#ZPD_Top_Att_Stat');
  await sleep(10000);

  const screenshot7 = await page.screenshot();
  console.log(
    chalk.green('[7/7] screenshot captured submit btn was pressed  \n path:')
  );
  saveScreenshot({ suffix: '0007', screenshot: screenshot7, sessionId });

  await browser.close();
})(url, userName, password).catch(logErrorAndExit);
