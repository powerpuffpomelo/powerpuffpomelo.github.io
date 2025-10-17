// 作品数据
let artworks = [];

// 从图片目录自动扫描并生成作品数据
async function loadArtworksData() {
    try {
        // 尝试从JSON文件加载额外信息
        let artworksInfo = {};
        try {
            const response = await fetch('/data/artworks.json');
            const data = await response.json();
            // 将作品信息转换为以图片路径为键的对象，方便查找
            data.artworks.forEach(artwork => {
                artworksInfo[artwork.image] = artwork;
            });
        } catch (error) {
            console.log('未找到作品信息文件或格式不正确，将只使用图片文件名作为信息');
        }

        // 扫描图片目录
        const years = await scanDirectory('data/images');
        
        // 处理扫描结果
        for (const year of years) {
            const months = await scanDirectory(`data/images/${year}`);
            
            for (const month of months) {
                const images = await scanDirectory(`data/images/${year}/${month}`);
                
                for (const image of images) {
                    const imagePath = `data/images/${year}/${month}/${image}`;
                    const date = `${year}-${month}-${image.substring(0, 8).substring(6, 8)}`;
                    
                    // 检查是否有该图片的额外信息
                    if (artworksInfo[imagePath]) {
                        // 使用已有信息，但更新路径
                        const artwork = artworksInfo[imagePath];
                        artwork.image = imagePath;
                        artworks.push(artwork);
                    } else {
                        // 创建新的作品信息
                        artworks.push({
                            id: artworks.length + 1,
                            title: `作品 ${image.substring(0, 8)}`,
                            date: date,
                            description: `创作于 ${date}`,
                            image: imagePath,
                            featured: true // 默认所有作品都是精选
                        });
                    }
                }
            }
        }
        
        // 按日期降序排序
        artworks.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 数据加载完成后触发事件
        const event = new Event('artworksLoaded');
        document.dispatchEvent(event);
    } catch (error) {
        console.error('加载作品数据失败:', error);
    }
}

// 扫描目录并返回文件/文件夹列表
async function scanDirectory(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return [];
        
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const items = [];
        const links = doc.querySelectorAll('a');
        
        for (const link of links) {
            const href = link.getAttribute('href');
            // 跳过父目录链接
            if (href === '../') continue;
            // 移除尾部的斜杠（如果是目录）
            items.push(href.replace('/', ''));
        }
        
        return items;
    } catch (error) {
        console.error(`扫描目录 ${path} 失败:`, error);
        return [];
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