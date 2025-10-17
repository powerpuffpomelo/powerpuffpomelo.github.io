// 作品数据
let artworks = [];

// 从 JSON 文件加载作品数据
async function loadArtworksData() {
    try {
        const response = await fetch('data/artworks.json');
        const data = await response.json();
        artworks = data.artworks;

        // 按日期降序排序
        artworks.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 数据加载完成后触发事件
        const event = new Event('artworksLoaded');
        document.dispatchEvent(event);
    } catch (error) {
        console.error('加载作品数据失败:', error);
    }
}

// 页面加载时获取数据
document.addEventListener('DOMContentLoaded', loadArtworksData);

// 获取所有年份
function getAllYears() {
    const years = new Set();
    artworks.forEach(artwork => {
        const year = artwork.date.split('-')[0];
        years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // 降序排列
}

// 按日期获取作品
function getArtworksByDate(date) {
    return artworks.filter(artwork => artwork.date === date);
}

// 获取特定年份的所有作品
function getArtworksByYear(year) {
    return artworks.filter(artwork => artwork.date.startsWith(year));
}

// 获取主推作品
function getFeaturedArtworks() {
    return artworks.filter(artwork => artwork.featured);
}

// 获取贡献数据（用于热力图）
function getContributionData() {
    const contributionData = {};
    
    artworks.forEach(artwork => {
        if (contributionData[artwork.date]) {
            contributionData[artwork.date]++;
        } else {
            contributionData[artwork.date] = 1;
        }
    });
    
    return contributionData;
}

// 格式化日期显示
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
}