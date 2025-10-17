// 首页脚本
document.addEventListener('DOMContentLoaded', function() {
    // 监听数据加载完成事件
    document.addEventListener('artworksLoaded', function() {
        // 加载主推作品
        loadFeaturedWorks();
    });
    
    // 创建图片查看器
    createImageViewer();
});

// 加载主推作品
function loadFeaturedWorks() {
    const featuredWorksContainer = document.getElementById('featured-works-container');
    const featuredArtworks = getFeaturedArtworks();
    
    featuredWorksContainer.innerHTML = ''; // 清空容器
    
    featuredArtworks.forEach(artwork => {
        const workItem = createWorkItem(artwork);
        featuredWorksContainer.appendChild(workItem);
    });
}

// 创建作品项
function createWorkItem(artwork) {
    const workItem = document.createElement('div');
    workItem.className = 'work-item';
    workItem.dataset.id = artwork.id;
    
    workItem.innerHTML = `
        <div class="work-image">
            <img src="${artwork.image}" alt="${artwork.title}" loading="lazy">
        </div>
        <div class="work-info">
            <h3>${artwork.title}</h3>
            <div class="date">${formatDate(artwork.date)}</div>
            <div class="description">${artwork.description}</div>
        </div>
    `;
    
    // 添加点击事件，打开图片查看器
    workItem.querySelector('.work-image').addEventListener('click', function() {
        openImageViewer(artwork.image, artwork.title);
    });
    
    return workItem;
}

// 创建图片查看器
function createImageViewer() {
    // 如果已存在查看器，则不重复创建
    if (document.querySelector('.image-viewer')) return;
    
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    
    viewer.innerHTML = `
        <div class="close"><i class="fas fa-times"></i></div>
        <div class="prev"><i class="fas fa-chevron-left"></i></div>
        <div class="next"><i class="fas fa-chevron-right"></i></div>
        <img src="" alt="">
    `;
    
    document.body.appendChild(viewer);
    
    // 关闭查看器
    viewer.querySelector('.close').addEventListener('click', function() {
        viewer.classList.remove('active');
    });
    
    // 点击背景关闭查看器
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer) {
            viewer.classList.remove('active');
        }
    });
}

// 打开图片查看器
function openImageViewer(imageSrc, imageAlt) {
    const viewer = document.querySelector('.image-viewer');
    const img = viewer.querySelector('img');
    
    img.src = imageSrc;
    img.alt = imageAlt || '';
    
    viewer.classList.add('active');
}