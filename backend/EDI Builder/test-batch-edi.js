/**
 * Test script to run batch EDI generation with test data
 * This will test the generateBatchEDIFromMTXData function
 */

import { testBatchData } from './test-batch-data.js';
import { generateBatchEDIFromMTXData } from './index.js';
import fs from 'fs';
import path from 'path';

async function runBatchEDITest() {
  console.log('=== Starting Batch EDI Generation Test ===\n');
  
  console.log(`Testing with ${testBatchData.claims.length} claims:`);
  testBatchData.claims.forEach((claim, index) => {
    const patient = `${claim.claimData.patient_first_name} ${claim.claimData.patient_last_name}`;
    const amount = claim.claimData.total_charge_amount;
    const services = claim.chargeData.length;
    console.log(`  ${index + 1}. ${patient} - $${amount} (${services} service${services > 1 ? 's' : ''})`);
  });
  
  console.log('\n=== Generating Batch EDI ===\n');
  
  try {
    // Call the batch generation function
    const ediResult = await generateBatchEDIFromMTXData(testBatchData);
    
    if (ediResult.success) {
      console.log('✅ Batch EDI generation successful!');
      console.log(`📄 EDI Content Length: ${ediResult.ediContent.length} characters`);
      console.log(`📊 Claims Processed: ${ediResult.claimsCount}`);
      console.log(`💰 Total Amount: $${ediResult.totalAmount}`);
      console.log(`🏥 Providers: ${ediResult.providersCount}`);
      
      // Save the EDI content to a file for inspection
      const outputDir = './output';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `batch_edi_${timestamp}.txt`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, ediResult.ediContent, 'utf8');
      console.log(`📁 EDI file saved: ${filepath}`);
      
      // Display first 500 characters for preview
      console.log('\n=== EDI Preview (First 500 characters) ===');
      console.log(ediResult.ediContent.substring(0, 500) + '...');
      
      // Show segment breakdown
      console.log('\n=== Segment Analysis ===');
      const segments = ediResult.ediContent.split('~');
      const segmentCounts = {};
      
      segments.forEach(segment => {
        const segmentType = segment.substring(0, 3);
        if (segmentType) {
          segmentCounts[segmentType] = (segmentCounts[segmentType] || 0) + 1;
        }
      });
      
      Object.entries(segmentCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count} segment${count > 1 ? 's' : ''}`);
        });
      
      console.log(`\n📈 Total Segments: ${segments.length - 1}`); // -1 for empty last element
      
    } else {
      console.error('❌ Batch EDI generation failed!');
      console.error('Error:', ediResult.error);
      
      if (ediResult.details) {
        console.error('Details:', ediResult.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
runBatchEDITest().catch(error => {
  console.error('Fatal error running test:', error);
  process.exit(1);
});
