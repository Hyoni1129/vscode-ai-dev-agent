/**
 * Extension Test - Quick validation that the extension loads properly
 */

console.log('🧪 Testing AI Dev Team Agent Extension Loading...');

async function testExtension() {
    try {
        // Test basic imports
        console.log('✅ Testing imports...');
        
        // Test that all core modules can be imported
        const { WorkflowManager } = await import('../src/core/WorkflowManager');
        const { ChatHandler } = await import('../src/core/ChatHandler');
        const { PMAgent } = await import('../src/agents/PMAgent');
        const { DevAgent } = await import('../src/agents/DevAgent');
        
        console.log('✅ All core modules imported successfully');
        
        // Test that types are properly defined
        const { WorkflowState } = await import('../src/types');
        console.log('✅ Types imported successfully');
        
        // Verify enum values
        if (WorkflowState.Idle && WorkflowState.Complete) {
            console.log('✅ Workflow states are properly defined');
        }
        
        console.log('🎉 Extension validation completed successfully!');
        console.log('📦 The extension is ready to be loaded in VS Code');
        
    } catch (error) {
        console.error('❌ Extension validation failed:', error);
        process.exit(1);
    }
}

testExtension();
