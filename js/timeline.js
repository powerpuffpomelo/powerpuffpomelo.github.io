// 时间轴页面脚本
document.addEventListener('DOMContentLoaded', function() {
    // 监听数据加载完成事件
    document.addEventListener('artworksLoaded', function() {
        // 初始化热力图
        initHeatmap();
        
        // 初始化时间轴作品
        initTimelineWorks();
        
        // 初始化日期筛选器
        initDateFilter();
    });
    
    // 创建图片查看器
    createImageViewer();
});

// 获取所有年份（保留函数但不再初始化选择器）
function getAllYears() {
    const years = new Set();
    
    // 确保artworksData已定义
    if (typeof artworksData !== 'undefined') {
        // 从作品数据中提取年份
        artworksData.forEach(artwork => {
            const date = new Date(artwork.date);
            years.add(date.getFullYear());
        });
    } else {
        // 如果数据未加载，返回当前年份
        years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
}

// 初始化热力图
function initHeatmap() {
    const heatmapContainer = document.getElementById('heatmap-container');
    const contributionData = getContributionData();
    
    // 默认显示当前年份
    const currentYear = new Date().getFullYear();
    let selectedYear = currentYear;
    
    heatmapContainer.innerHTML = '';
    
    // 计算过去一年的总作品数
    const totalWorks = calculateTotalWorksLastYear();
    
    // 创建标题（放在方框外上方）
    const titleElement = document.createElement('h3');
    titleElement.className = 'contribution-title';
    titleElement.textContent = `过去一年画了 ${totalWorks} 幅画`;
    heatmapContainer.appendChild(titleElement);
    
    // 创建GitHub风格的贡献图容器
    const contributionBox = document.createElement('div');
    contributionBox.className = 'contribution-box';
    heatmapContainer.appendChild(contributionBox);
    
    // 创建热力图主容器
    const graphContainer = document.createElement('div');
    graphContainer.className = 'contribution-graph';
    contributionBox.appendChild(graphContainer);
    
    // 创建月份标签行
    const monthsRow = document.createElement('div');
    monthsRow.className = 'months-row';
    graphContainer.appendChild(monthsRow);
    
    // 获取当前日期和一年前的日期
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(today.getDate() + 1);
    
    // 创建月份标签（从一年前到现在）
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // 计算需要显示的月份
    const monthLabels = [];
    let currentMonth = new Date(oneYearAgo);
    
    // 生成从一年前到现在的月份标签
    while (currentMonth <= today) {
        monthLabels.push({
            month: months[currentMonth.getMonth()],
            position: Math.floor((currentMonth - oneYearAgo) / (1000 * 60 * 60 * 24 * 7))
        });
        
        // 移到下个月
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        currentMonth.setDate(1);
    }
    
    // 添加月份标签
    monthLabels.forEach(item => {
        const monthLabel = document.createElement('div');
        monthLabel.className = 'month-label';
        monthLabel.textContent = item.month;
        monthLabel.style.gridColumn = item.position + 1;
        monthsRow.appendChild(monthLabel);
    });
    
    // 创建星期标签和网格容器
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'grid-wrapper';
    graphContainer.appendChild(gridWrapper);
    
    // 创建星期标签
    const weekdaysCol = document.createElement('div');
    weekdaysCol.className = 'weekdays-col';
    
    const weekdays = ['Mon', 'Wed', 'Fri'];
    weekdays.forEach(weekday => {
        const weekdayLabel = document.createElement('div');
        weekdayLabel.className = 'weekday-label';
        weekdayLabel.textContent = weekday;
        weekdaysCol.appendChild(weekdayLabel);
    });
    
    gridWrapper.appendChild(weekdaysCol);
    
    // 创建热力图网格
    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';
    gridWrapper.appendChild(heatmapGrid);
    
    // 创建GitHub风格的热力图
    createGithubStyleHeatmap(heatmapGrid, selectedYear, contributionData);
    
    // 添加颜色说明
    const legend = document.createElement('div');
    legend.className = 'contribution-legend';
    legend.innerHTML = `
        <ul class="legend-dots">
            <li class="legend-dot level-0"></li>
            <li class="legend-dot level-1"></li>
            <li class="legend-dot level-2"></li>
            <li class="legend-dot level-3"></li>
            <li class="legend-dot level-4"></li>
        </ul>
    `;
    graphContainer.appendChild(legend);
    
    // 创建年份选择器按钮组
    const yearButtons = document.createElement('div');
    yearButtons.className = 'year-buttons';
    
    // 获取所有年份并排序
    const years = getAllYears().sort((a, b) => b - a);
    
    // 为每个年份创建按钮
    years.forEach(year => {
        const yearBtn = document.createElement('button');
        yearBtn.className = 'year-btn';
        yearBtn.textContent = year;
        if (year === selectedYear) {
            yearBtn.classList.add('active');
        }
        yearBtn.addEventListener('click', function() {
            // 更新选中的年份
            selectedYear = year;
            
            // 移除所有按钮的active类
            document.querySelectorAll('.year-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 添加active类到当前按钮
            this.classList.add('active');
            
            // 重新创建热力图
            const heatmapGrid = document.querySelector('.heatmap-grid');
            heatmapGrid.innerHTML = '';
            createGithubStyleHeatmap(heatmapGrid, selectedYear, contributionData);
            
            // 更新时间轴作品
            initTimelineWorks(selectedYear);
        });
        yearButtons.appendChild(yearBtn);
    });
    
    // 将年份按钮添加到热力图容器外部
    heatmapContainer.appendChild(yearButtons);
}

// 创建GitHub风格的热力图
function createGithubStyleHeatmap(container, year, contributionData) {
    // 获取当前日期
    const today = new Date();
    
    // 计算一年前的日期
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(today.getDate() + 1); // 加1天，使其包含整整一年
    
    // 计算总周数（GitHub风格是从右到左显示53周）
    const totalWeeks = 53;
    
    // 创建7行53列的网格
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < totalWeeks; col++) {
            // 计算日期：从右上角开始，向左移动
            const cellDate = new Date(today);
            cellDate.setDate(today.getDate() - (totalWeeks - 1 - col) * 7 - (6 - row));
            
            const dateString = cellDate.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
            const year = cellDate.getFullYear();
            const month = cellDate.getMonth() + 1;
            const day = cellDate.getDate();
            
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.dataset.date = dateString;
            
            // 设置贡献等级
            const count = contributionData[dateString] || 0;
            const contributionLevel = getContributionLevel(count);
            cell.classList.add(`level-${contributionLevel}`);
            
            // 添加提示信息
            cell.title = `${year}年${month}月${day}日画了 ${count} 幅画`;
            
            // 添加点击事件，筛选该日期的作品
            cell.addEventListener('click', function() {
                document.getElementById('date-filter').value = dateString;
                filterWorksByDate(dateString);
            });
            
            container.appendChild(cell);
        }
    }
}

// 计算过去一年的总作品数
function calculateTotalWorksLastYear() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(today.getDate() + 1);
    
    return artworks.filter(artwork => {
        const artworkDate = new Date(artwork.date);
        return artworkDate >= oneYearAgo && artworkDate <= today;
    }).length;
}

// 初始化时间轴作品
function initTimelineWorks(selectedYear) {
    const timelineWorksContainer = document.getElementById('timeline-works-container');
    
    // 如果没有传入年份，使用当前年份
    if (!selectedYear) {
        selectedYear = new Date().getFullYear().toString();
    }
    
    const yearArtworks = getArtworksByYear(selectedYear);
    
    // 按日期分组
    const groupedArtworks = groupArtworksByDate(yearArtworks);
    
    timelineWorksContainer.innerHTML = '';
    
    // 加载分组后的作品
    loadGroupedArtworks(groupedArtworks, timelineWorksContainer);
}

// 初始化日期筛选器
function initDateFilter() {
    const dateFilter = document.getElementById('date-filter');
    const clearFilterBtn = document.getElementById('clear-filter');
    
    // 清除筛选按钮点击事件
    clearFilterBtn.addEventListener('click', function() {
        dateFilter.value = '';
        initTimelineWorks(); // 重新加载所有作品
    });
    
    // 日期筛选器变化事件
    dateFilter.addEventListener('change', function() {
        const selectedDate = dateFilter.value;
        if (selectedDate) {
            filterWorksByDate(selectedDate);
        } else {
            initTimelineWorks(); // 重新加载所有作品
        }
    });
}

// 按日期筛选作品
function filterWorksByDate(date) {
    const timelineWorksContainer = document.getElementById('timeline-works-container');
    const dateArtworks = getArtworksByDate(date);
    
    // 按日期分组
    const groupedArtworks = groupArtworksByDate(dateArtworks);
    
    timelineWorksContainer.innerHTML = '';
    
    // 加载分组后的作品
    loadGroupedArtworks(groupedArtworks, timelineWorksContainer);
}

// 按日期分组作品
function groupArtworksByDate(artworks) {
    const grouped = {};
    
    artworks.forEach(artwork => {
        if (!grouped[artwork.date]) {
            grouped[artwork.date] = [];
        }
        grouped[artwork.date].push(artwork);
    });
    
    // 按日期降序排序
    return Object.keys(grouped)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((result, date) => {
            result[date] = grouped[date];
            return result;
        }, {});
}

// 加载分组后的作品
function loadGroupedArtworks(groupedArtworks, container) {
    for (const date in groupedArtworks) {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'date-group';
        
        const dateHeader = document.createElement('h3');
        dateHeader.className = 'date-header';
        dateHeader.textContent = formatDate(date);
        dateGroup.appendChild(dateHeader);
        
        const worksContainer = document.createElement('div');
        worksContainer.className = 'works-container';
        
        groupedArtworks[date].forEach(artwork => {
            const workItem = createWorkItem(artwork);
            worksContainer.appendChild(workItem);
        });
        
        dateGroup.appendChild(worksContainer);
        container.appendChild(dateGroup);
    }
}

// 创建作品项
function createWorkItem(artwork) {
    const workItem = document.createElement('div');
    workItem.className = 'work-item';
    workItem.dataset.id = artwork.id;

    // 修正图片路径，添加 data/ 前缀
    const imagePath = `data/${artwork.image}`;

    workItem.innerHTML = `
        <div class="work-image">
            <img src="${imagePath}" alt="${artwork.title}" loading="lazy">
        </div>
        <div class="work-info">
            <h3>${artwork.title}</h3>
            <div class="description">${artwork.description}</div>
        </div>
    `;

    // 添加点击事件，打开图片查看器
    workItem.querySelector('.work-image').addEventListener('click', function() {
        openImageViewer(imagePath, artwork.title);
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

// 计算指定年份中的第n天对应的日期
function calculateDate(year, dayOfYear) {
    const date = new Date(year, 0); // 1月1日
    date.setDate(dayOfYear);
    return date;
}

// 判断是否为闰年
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 获取贡献等级（0-4）
function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
}