import { launch } from '../../lib/driver.mjs';
import { gotoMyModels } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent, assertPaginatedGrid, captureScreenshot } from '../../lib/menuLayoutAssert.mjs';
import {
  measureHolderPanel,
  measureHolderAnchors,
  assertSingleHeaderPanelContract,
  assertHolderAnchorContract,
  filterConsoleErrors,
  writeHolderLayoutArtifact,
} from '../../lib/holderLayoutAssert.mjs';
import { buildSingleHeaderLayoutContract } from '../../../src/Components/Common/MenuStageLayout/singleHeaderLayoutMath.js';
import { HOLDER_VARIANTS } from '../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js';

const CONTRACT = buildSingleHeaderLayoutContract('MY_MODELS', 'MY_MODELS');

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoMyModels(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'MY_MODELS' });

    const panel = await page.$('[data-testid="menu-panel-shell"]');
    if (!panel) {
      throw new Error('MyModels MenuPanelShell not found');
    }

    const panelMeasured = await measureHolderPanel(page);
    const panelErrors = assertSingleHeaderPanelContract(CONTRACT, panelMeasured);
    if (panelErrors.length > 0) {
      throw new Error(panelErrors.join('; '));
    }

    const anchors = await measureHolderAnchors(page);
    const anchorErrors = assertHolderAnchorContract(
      HOLDER_VARIANTS.MY_MODELS,
      anchors,
      CONTRACT.layoutScale,
      { tolerance: 24 },
    );
    if (anchorErrors.length > 0) {
      throw new Error(anchorErrors.join('; '));
    }

    await assertPaginatedGrid(page, { minItems: 1, maxItems: 9 });

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    if (!checkmark) {
      throw new Error('MyModels checkmark corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-mymodels');
    }

    writeHolderLayoutArtifact({
      screenKey: 'MY_MODELS',
      contract: CONTRACT,
      panel: panelMeasured,
      anchors,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'mymodels-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-mymodels.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-mymodels.layout:', e.message);
  process.exit(1);
});