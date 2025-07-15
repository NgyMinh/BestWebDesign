// crypto-donation.js
class CryptoDonation {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAccount = null;
        this.contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE'; // Thay bằng địa chỉ contract thực tế
        this.contractABI = [
            "function donate(string memory _project, string memory _message, bool _isAnonymous) public payable",
            "function getDonation(uint256 _donationId) public view returns (address, uint256, string, string, uint256, bool)",
            "function getLatestDonations(uint256 _count) public view returns (uint256[], address[], uint256[], string[], uint256[], bool[])",
            "function totalDonations() public view returns (uint256)",
            "function donationCount() public view returns (uint256)",
            "event DonationMade(uint256 indexed donationId, address indexed donor, uint256 amount, string project, string message, bool isAnonymous)"
        ];

        this.init();
    }

    async init() {
        await this.detectMetaMask();
        this.setupEventListeners();
        this.loadCryptoDonations();
    }

    async detectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            this.web3 = new ethers.providers.Web3Provider(window.ethereum);
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.web3);

            // Hiển thị nút crypto donation
            this.showCryptoOption();
        } else {
            console.log('MetaMask is not installed');
            this.hideCryptoOption();
        }
    }

    showCryptoOption() {
        // Thêm option crypto vào payment methods
        const paymentMethods = document.getElementById('payment-methods');
        if (paymentMethods) {
            const cryptoOption = document.createElement('div');
            cryptoOption.className = 'payment-option crypto-payment';
            cryptoOption.innerHTML = 'Thanh Toán Bằng Tiền Điện Tử (ETH) <span>🔐</span>';
            cryptoOption.onclick = () => this.selectCryptoPayment();
            paymentMethods.appendChild(cryptoOption);
        }
    }

    hideCryptoOption() {
        const cryptoOption = document.querySelector('.crypto-payment');
        if (cryptoOption) {
            cryptoOption.remove();
        }
    }

    setupEventListeners() {
        // Thêm event listener cho nút connect MetaMask
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-metamask')) {
                this.connectMetaMask();
            }
            if (e.target.classList.contains('crypto-donate-btn')) {
                this.processCryptoDonation();
            }
        });
    }

    async connectMetaMask() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAccount = accounts[0];

            // Hiển thị thông tin account
            this.displayAccountInfo();

            // Kiểm tra network
            await this.checkNetwork();

            return true;
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('Lỗi kết nối MetaMask: ' + error.message);
            return false;
        }
    }

    async checkNetwork() {
        const network = await this.web3.getNetwork();
        console.log('Current network:', network);

        // Kiểm tra xem có đang ở đúng network không (ví dụ: Goerli testnet)
        const expectedChainId = 5; // Goerli
        if (network.chainId !== expectedChainId) {
            await this.switchNetwork(expectedChainId);
        }
    }

    async switchNetwork(chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
        } catch (error) {
            console.error('Error switching network:', error);
        }
    }

    displayAccountInfo() {
        const accountInfo = document.getElementById('account-info');
        if (accountInfo) {
            accountInfo.innerHTML = `
                <div class="metamask-connected">
                    <h5>🦊 MetaMask Connected</h5>
                    <p>Account: ${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}</p>
                </div>
            `;
        }
    }

    selectCryptoPayment() {
        // Xóa active khỏi các payment option khác
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });

        // Thêm active cho crypto payment
        document.querySelector('.crypto-payment').classList.add('active');

        // Hiển thị thông tin crypto payment
        this.showCryptoPaymentInfo();
    }

    showCryptoPaymentInfo() {
        const paymentInfo = document.getElementById('crypto-payment-info');
        if (!paymentInfo) {
            const cryptoInfo = document.createElement('div');
            cryptoInfo.id = 'crypto-payment-info';
            cryptoInfo.className = 'crypto-payment-info mt-3';
            cryptoInfo.innerHTML = `
                <div class="alert alert-info">
                    <h6>🔐 Thanh Toán Bằng Tiền Điện Tử</h6>
                    <p>Sử dụng MetaMask để quyên góp bằng ETH. Giao dịch sẽ được lưu trữ trên blockchain.</p>
                    <div id="account-info"></div>
                    ${!this.userAccount ? '<button class="btn btn-primary connect-metamask">Kết nối MetaMask</button>' : ''}
                </div>
            `;

            document.getElementById('payment-methods').appendChild(cryptoInfo);
        }

        if (this.userAccount) {
            this.displayAccountInfo();
        }
    }

    async processCryptoDonation() {
        if (!this.userAccount) {
            const connected = await this.connectMetaMask();
            if (!connected) return;
        }

        try {
            // Lấy thông tin donation
            const donationData = this.collectDonationData();
            if (!donationData) return;

            // Hiển thị loading
            this.showLoadingState();

            // Thực hiện donation
            const signer = this.web3.getSigner();
            const contractWithSigner = this.contract.connect(signer);

            const tx = await contractWithSigner.donate(
                donationData.project,
                donationData.message,
                donationData.isAnonymous,
                {
                    value: ethers.utils.parseEther(donationData.amount.toString()),
                    gasLimit: 300000
                }
            );

            console.log('Transaction sent:', tx.hash);

            // Lưu transaction hash
            await this.saveCryptoDonation(tx.hash, donationData);

            // Đợi transaction confirm
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Hiển thị thành công
            this.showSuccessState(tx.hash);

            // Chuyển sang step 4
            goToStep(4);

        } catch (error) {
            console.error('Error processing crypto donation:', error);
            this.showErrorState(error.message);
        }
    }

    collectDonationData() {
        const country = document.querySelector('select[class*="donate-input-with-icon-1"]').value;
        const project = document.querySelector('select[class*="donate-input-with-icon-2"]').value;
        const date = document.querySelector('input[class*="donate-input-with-icon-3"]').value;
        const name = document.querySelector('input[class*="donate-input-with-icon-4"]').value;
        const email = document.querySelector('input[class*="donate-input-with-icon-5"]').value;
        const phone = document.querySelector('input[class*="donate-input-with-icon-6"]').value;
        const address = document.querySelector('input[class*="donate-input-with-icon-7"]').value;

        // Lấy số tiền
        const activeBtn = document.querySelector('.donate-btn-money.active');
        const customAmount = document.getElementById('donationAmount').value;
        let amount = 0;

        if (activeBtn && activeBtn.textContent !== 'CON SỐ KHÁC') {
            amount = parseFloat(activeBtn.textContent.replace(/[.,]/g, ''));
        } else if (customAmount) {
            amount = parseFloat(customAmount.replace(/[.,]/g, ''));
        }

        // Chuyển đổi VND sang ETH (tỷ giá giả định)
        const vndToEth = 0.00000004; // 1 VND = 0.00000004 ETH (cần cập nhật tỷ giá thực tế)
        const ethAmount = amount * vndToEth;

        const isAnonymous = document.getElementById('agree3').checked;

        if (!project || !name || !email || ethAmount <= 0) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return null;
        }

        return {
            country,
            project,
            date,
            name,
            email,
            phone,
            address,
            amount: ethAmount,
            amountVND: amount,
            isAnonymous,
            message: `Donation from ${name} - ${email}`
        };
    }

    async saveCryptoDonation(txHash, donationData) {
        try {
            const response = await fetch('/api/crypto-donation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    txHash,
                    donor: this.userAccount,
                    amount: donationData.amount,
                    project: donationData.project,
                    message: donationData.message,
                    isAnonymous: donationData.isAnonymous
                })
            });

            const result = await response.json();
            console.log('Crypto donation saved:', result);
        } catch (error) {
            console.error('Error saving crypto donation:', error);
        }
    }

    showLoadingState() {
        const btn = document.querySelector('.btn-next');
        if (btn) {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
            btn.disabled = true;
        }
    }

    showSuccessState(txHash) {
        const btn = document.querySelector('.btn-next');
        if (btn) {
            btn.innerHTML = '✅ Thành công!';
            btn.disabled = false;
        }

        // Hiển thị thông tin transaction
        const step4 = document.getElementById('step4');
        if (step4) {
            const txInfo = document.createElement('div');
            txInfo.className = 'tx-info mt-3';
            txInfo.innerHTML = `
                <div class="alert alert-success">
                    <h6>🔐 Giao dịch Blockchain</h6>
                    <p>Transaction Hash: <a href="https://goerli.etherscan.io/tx/${txHash}" target="_blank">${txHash}</a></p>
                    <p>Bạn có thể xem chi tiết giao dịch trên Etherscan</p>
                </div>
            `;
            step4.appendChild(txInfo);
        }
    }

    showErrorState(error) {
        const btn = document.querySelector('.btn-next');
        if (btn) {
            btn.innerHTML = '❌ Thử lại';
            btn.disabled = false;
        }

        alert('Lỗi giao dịch: ' + error);
    }

    async loadCryptoDonations() {
        try {
            const response = await fetch('/api/crypto-donations?limit=20');
            const result = await response.json();

            if (result.success) {
                this.displayCryptoDonations(result.data.donations);
            }
        } catch (error) {
            console.error('Error loading crypto donations:', error);
        }
    }

    displayCryptoDonations(donations) {
        const tbody = document.getElementById('donationTableBody');
        if (!tbody) return;

        // Thêm crypto donations vào table
        donations.forEach((donation, index) => {
            const row = document.createElement('tr');
            row.className = 'crypto-donation-row';
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${donation.donor} <span class="badge bg-primary">ETH</span></td>
                <td>${parseFloat(donation.amount).toFixed(4)} ETH</td>
                <td>${donation.timestamp}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Khởi tạo crypto donation khi trang load
document.addEventListener('DOMContentLoaded', () => {
    const cryptoDonation = new CryptoDonation();

    // Thêm vào global scope để có thể access từ các function khác
    window.cryptoDonation = cryptoDonation;
});

// Utility functions
function formatEthAmount(amount) {
    return parseFloat(amount).toFixed(4);
}

function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
}

// Cập nhật step navigation để hỗ trợ crypto payment
const originalBtnNext = document.querySelector('.btn-next');
if (originalBtnNext) {
    originalBtnNext.addEventListener('click', (e) => {
        const currentStep = document.querySelector('[id^="step"]:not(.hidden)').id;
        const isCryptoSelected = document.querySelector('.crypto-payment.active');

        if (currentStep === 'step3' && isCryptoSelected) {
            e.preventDefault();
            if (window.cryptoDonation) {
                window.cryptoDonation.processCryptoDonation();
            }
        }
    });
}