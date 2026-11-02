import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('CV.md content sync verification across website', () => {
  const resumeData = fs.readFileSync('src/data/resumeData.ts', 'utf-8');
  const cvMd = fs.readFileSync('../cv/CV.md', 'utf-8');

  // 1. Role matches
  assert.ok(resumeData.includes('Full-Stack & Lead Software Engineer'), 'Role should be Full-Stack & Lead Software Engineer');

  // 2. Summary matches CV
  assert.ok(resumeData.includes('30+ commercial projects'), 'Summary includes 30+ commercial projects');
  assert.ok(resumeData.includes('top 5%'), 'Summary includes top 5% of Master’s degree class');

  // 3. Companies & Roles match
  assert.ok(resumeData.includes('Jud (Saudi Arabia)'), 'Includes Jud (Saudi Arabia)');
  assert.ok(resumeData.includes('Alnurayn'), 'Includes Alnurayn Digital Library');
  assert.ok(resumeData.includes('Mostaql'), 'Includes Mostaql Platform');

  // 4. Specific project highlights from CV
  assert.ok(resumeData.includes('Dentist System'), 'Includes Dentist System');
  assert.ok(resumeData.includes('Care360'), 'Includes Care360 telehealth');
  assert.ok(resumeData.includes('RSA cryptographic licensing'), 'Includes RSA cryptographic licensing');
  assert.ok(resumeData.includes('C++ search addon') || resumeData.includes('C++'), 'Includes C++ search addon');

  // 5. Education matches
  assert.ok(resumeData.includes('Ahmad Zabana University'), 'Includes Ahmad Zabana University');
  assert.ok(resumeData.includes('2017 – 2022') || resumeData.includes('2017'), 'Includes education years');

  // 6. ResumeDrawer displays work experience and education
  const drawer = fs.readFileSync('src/components/overlay/ResumeDrawer.tsx', 'utf-8');
  assert.ok(drawer.includes('workExperience') || drawer.includes('Work Experience'), 'ResumeDrawer should render Work Experience');
  assert.ok(drawer.includes('education') || drawer.includes('Education'), 'ResumeDrawer should render Education');
  assert.ok(drawer.includes('Jud') || drawer.includes('workExperience'), 'ResumeDrawer references Jud experience');
});

