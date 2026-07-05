import { launch } from '../../lib/driver.mjs';
import { gotoWorldPicker } from '../../lib/menuDriver.mjs';
import {
  assertMenuStagePresent,
  assertDualHeader,
  assertPaginatedGrid,
  captureScreenshot,
} from '../../lib/menuLayoutAssert.mjs';
import {
  measureHolderPanel,
  measureHolderAnchors,
  assertStartWorldPanelContract,
  assertHolderAnchorContract,
  filterConsoleErrors,
  writeHolderLayoutArtifact,
} from '../../lib/holderLayoutAssert.mjs';
import { buildStartLayoutContract } from '../../../src/Components/Common/MenuStageLayout/startLayoutMath.js';
import { HOLDER_VARIANTS } from '../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js';

const START_CONTRACT = buildStartLayoutContract();

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoWorldPicker(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'START_WORLD' });
    await assertDualHeader(page);
    await assertPaginatedGrid(page, { minItems: 9, maxItems: 9 });

    const panelMeasured = await measureHolderPanel(page);
    const panelErrors = assertStartWorldPanelContract(START_CONTRACT, panelMeasured);
    if (panelErrors.length > 0) {
      throw new Error(`Local worlds panel: ${panelErrors.join('; ')}`);
    }

    const leave = await page.$('[data-testid="menu-corner-leave"]');
    if (!leave) {
      throw new Error('Start screen: leave corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-start-local');
    }

    const localTab = await page.$('[data-testid="world-tab-local"]');
    const sharedTab = await page.$('[data-testid="world-tab-shared"]');
    const localActiveBefore = await localTab.evaluate((el) => el.getAttribute('data-active'));
    if (localActiveBefore !== 'true') {
      throw new Error('Local tab should be active on load');
    }
    await sharedTab.click();
    const sharedActive = await sharedTab.evaluate((el) => el.getAttribute('data-active'));
    if (sharedActive !== 'true') {
      throw new Error('Shared tab should be active after click');
    }
    await new Promise((r) => setTimeout(r, 500));

    const sharedAnchors = await measureHolderAnchors(page);
    const sharedFooterErrors = assertHolderAnchorContract(
      HOLDER_VARIANTS.WORLD_DARK,
      sharedAnchors,
      START_CONTRACT.layoutScale,
      { tolerance: 24 },
    );
    if (sharedFooterErrors.length > 0) {
      throw new Error(`Shared worlds footer: ${sharedFooterErrors.join('; ')}`);
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-start-shared');
    }

    writeHolderLayoutArtifact({
      screenKey: 'START_WORLD',
      contract: START_CONTRACT,
      localPanel: panelMeasured,
      sharedAnchors,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'start-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-start.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-start.layout:', e.message);
  process.exit(1);
});