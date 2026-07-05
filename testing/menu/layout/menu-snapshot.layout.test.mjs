import { launch } from '../../lib/driver.mjs';
import { gotoSnapshot } from '../../lib/menuDriver.mjs';
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

const CONTRACT = buildSingleHeaderLayoutContract('SNAPSHOT', 'SNAPSHOT');

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoSnapshot(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'SNAPSHOT' });

    const panel = await page.$('[data-testid="menu-panel-shell"]');
    if (!panel) {
      throw new Error('SnapShot MenuPanelShell not found');
    }

    const panelMeasured = await measureHolderPanel(page);
    const panelErrors = assertSingleHeaderPanelContract(CONTRACT, panelMeasured);
    if (panelErrors.length > 0) {
      throw new Error(panelErrors.join('; '));
    }

    const anchors = await measureHolderAnchors(page);
    const anchorErrors = assertHolderAnchorContract(
      HOLDER_VARIANTS.SNAPSHOT,
      anchors,
      CONTRACT.layoutScale,
      { tolerance: 22 },
    );
    if (anchorErrors.length > 0) {
      throw new Error(anchorErrors.join('; '));
    }

    await assertPaginatedGrid(page, { minItems: 1, maxItems: 9 });

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    if (!checkmark) {
      throw new Error('SnapShot checkmark corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-snapshot');
    }

    writeHolderLayoutArtifact({
      screenKey: 'SNAPSHOT',
      contract: CONTRACT,
      panel: panelMeasured,
      anchors,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'snapshot-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-snapshot.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-snapshot.layout:', e.message);
  process.exit(1);
});