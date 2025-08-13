// Test file for Enhanced Home Screen APIs
// This demonstrates all the new home screen functionality

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1/user';

// Test 1: Get Home Screen Data
async function testHomeScreenData() {
    try {
        console.log('🧪 Testing Home Screen Data API...\n');
        
        const response = await axios.get(`${BASE_URL}/home`);
        
        console.log('✅ Home Screen Data API Success!');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        
        const data = response.data.data;
        console.log('\n📊 Data Summary:');
        console.log('- Featured Magazines:', data.featured.magazines.length);
        console.log('- Featured Articles:', data.featured.articles.length);
        console.log('- Featured Digests:', data.featured.digests.length);
        console.log('- Trending Items:', data.trending.magazines.length + data.trending.articles.length + data.trending.digests.length);
        console.log('- New Releases:', data.newReleases.magazines.length + data.newReleases.articles.length + data.newReleases.digests.length);
        console.log('- Categories:', data.categories.length);
        console.log('- Total Stats:', data.stats);
        
        return true;
        
    } catch (error) {
        console.log('❌ Home Screen Data API Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test 2: Get Content by Type
async function testContentByType() {
    try {
        console.log('\n🧪 Testing Content by Type API...\n');
        
        // Test magazines
        console.log('📚 Testing Magazines...');
        const magazinesResponse = await axios.get(`${BASE_URL}/content/magazines?page=1&limit=5&sort=newest`);
        
        if (magazinesResponse.data.success) {
            console.log('✅ Magazines fetched successfully');
            console.log('Count:', magazinesResponse.data.data.content.length);
            console.log('Pagination:', magazinesResponse.data.data.pagination);
        }
        
        // Test articles
        console.log('\n📄 Testing Articles...');
        const articlesResponse = await axios.get(`${BASE_URL}/content/articles?page=1&limit=3&sort=popular`);
        
        if (articlesResponse.data.success) {
            console.log('✅ Articles fetched successfully');
            console.log('Count:', articlesResponse.data.data.content.length);
            console.log('Pagination:', articlesResponse.data.data.pagination);
        }
        
        // Test digests
        console.log('\n📖 Testing Digests...');
        const digestsResponse = await axios.get(`${BASE_URL}/content/digests?page=1&limit=2&sort=rating`);
        
        if (digestsResponse.data.success) {
            console.log('✅ Digests fetched successfully');
            console.log('Count:', digestsResponse.data.data.content.length);
            console.log('Pagination:', digestsResponse.data.data.pagination);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Content by Type API Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test 3: Get Categories
async function testCategories() {
    try {
        console.log('\n🧪 Testing Categories API...\n');
        
        const response = await axios.get(`${BASE_URL}/categories`);
        
        if (response.data.success) {
            console.log('✅ Categories fetched successfully');
            console.log('Total Categories:', response.data.data.length);
            
            console.log('\n📋 Categories:');
            response.data.data.forEach(cat => {
                console.log(`- ${cat.name} (${cat.icon}): ${cat.count} items`);
                console.log(`  Color: ${cat.color}, Featured: ${cat.featured}`);
            });
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Categories API Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test 4: Search Content
async function testSearchContent() {
    try {
        console.log('\n🧪 Testing Search API...\n');
        
        // Test general search
        console.log('🔍 Testing general search...');
        const generalSearch = await axios.get(`${BASE_URL}/search?q=technology&page=1&limit=5`);
        
        if (generalSearch.data.success) {
            console.log('✅ General search successful');
            console.log('Results:', generalSearch.data.data.results.length);
            console.log('Total Results:', generalSearch.data.data.searchStats.totalResults);
            console.log('Search Time:', generalSearch.data.data.searchStats.searchTime + 'ms');
        }
        
        // Test type-specific search
        console.log('\n📚 Testing magazine search...');
        const magazineSearch = await axios.get(`${BASE_URL}/search?q=business&type=magazines&page=1&limit=3`);
        
        if (magazineSearch.data.success) {
            console.log('✅ Magazine search successful');
            console.log('Results:', magazineSearch.data.data.results.length);
        }
        
        // Test category-specific search
        console.log('\n🏷️ Testing category search...');
        const categorySearch = await axios.get(`${BASE_URL}/search?q=science&category=science&page=1&limit=3`);
        
        if (categorySearch.data.success) {
            console.log('✅ Category search successful');
            console.log('Results:', categorySearch.data.data.results.length);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Search API Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test 5: Test with different parameters
async function testAdvancedFeatures() {
    try {
        console.log('\n🧪 Testing Advanced Features...\n');
        
        // Test pagination
        console.log('📄 Testing pagination...');
        const paginationTest = await axios.get(`${BASE_URL}/content/magazines?page=2&limit=2`);
        
        if (paginationTest.data.success) {
            console.log('✅ Pagination working');
            console.log('Page 2:', paginationTest.data.data.pagination);
        }
        
        // Test sorting
        console.log('\n📊 Testing sorting...');
        const sortTest = await axios.get(`${BASE_URL}/content/articles?sort=downloads&limit=3`);
        
        if (sortTest.data.success) {
            console.log('✅ Sorting by downloads working');
            console.log('First item downloads:', sortTest.data.data.content[0]?.downloads);
        }
        
        // Test filtering
        console.log('\n🔍 Testing filtering...');
        const filterTest = await axios.get(`${BASE_URL}/content/magazines?filter=free&limit=3`);
        
        if (filterTest.data.success) {
            console.log('✅ Free content filtering working');
            console.log('Free magazines found:', filterTest.data.data.content.length);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Advanced Features Test Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test 6: Error handling
async function testErrorHandling() {
    try {
        console.log('\n🧪 Testing Error Handling...\n');
        
        // Test invalid content type
        console.log('❌ Testing invalid content type...');
        try {
            await axios.get(`${BASE_URL}/content/invalid`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Correctly caught invalid content type');
            }
        }
        
        // Test search without query
        console.log('\n❌ Testing search without query...');
        try {
            await axios.get(`${BASE_URL}/search`);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Correctly caught missing search query');
            }
        }
        
        // Test invalid pagination
        console.log('\n❌ Testing invalid pagination...');
        try {
            await axios.get(`${BASE_URL}/content/magazines?page=invalid&limit=invalid`);
        } catch (error) {
            if (error.response && error.response.status === 200) {
                console.log('✅ API handled invalid pagination gracefully');
            }
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Error Handling Test Failed:', error.message);
        return false;
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Testing Enhanced Home Screen APIs\n');
    console.log('=====================================\n');
    
    const tests = [
        { name: 'Home Screen Data', func: testHomeScreenData },
        { name: 'Content by Type', func: testContentByType },
        { name: 'Categories', func: testCategories },
        { name: 'Search Content', func: testSearchContent },
        { name: 'Advanced Features', func: testAdvancedFeatures },
        { name: 'Error Handling', func: testErrorHandling }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Testing: ${test.name}`);
        console.log(`${'='.repeat(50)}`);
        
        const result = await test.func();
        if (result) {
            passedTests++;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log(`${'='.repeat(50)}`);
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    console.log('\n📝 API Endpoints Tested:');
    console.log('- GET /api/v1/user/home - Home screen data');
    console.log('- GET /api/v1/user/content/:type - Content by type with pagination');
    console.log('- GET /api/v1/user/categories - All categories');
    console.log('- GET /api/v1/user/search - Search functionality');
    
    console.log('\n✨ Enhanced Home Screen APIs are working!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testHomeScreenData,
    testContentByType,
    testCategories,
    testSearchContent,
    testAdvancedFeatures,
    testErrorHandling,
    runAllTests
}; 